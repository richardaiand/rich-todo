import { useState, useRef, useEffect } from 'react';
import { Pencil, X, Star, Sun, Plus, Trash2, Hash } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { playClickSound } from '../utils/sound';
import { Priority, Recurrence, Task } from '../types';
import { format, parseISO } from 'date-fns';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#107c10' },
  { value: 'normal', label: 'Normal', color: '#0078d4' },
  { value: 'high', label: 'High', color: '#d83b01' },
];

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Every weekday' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const SUBTASK_COLORS = ['#C91A09', '#0055BF', '#237841', '#FFC107', '#8764b8', '#d83b01', '#00b7c3'];

export default function TaskDetails() {
  const {
    selectedTaskId, setSelectedTaskId, getTaskById,
    updateTask, toggleTaskComplete, toggleMyDay, toggleImportant,
    deleteTask, addSubTask, toggleSubTask, deleteSubTask, updateSubTaskTitle, reorderSubTasks,
    tags, addTag, theme,
  } = useTodos();

  const task = selectedTaskId ? getTaskById(selectedTaskId) : undefined;
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [task?.notes]);

  if (!task) return null;

  const handleUpdateTask = (updates: Partial<Task>) => {
    updateTask(task.id, updates);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const colors = ['#0078d4', '#107c10', '#d83b01', '#8764b8', '#ffc107', '#00b7c3'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      addTag(newTagName.trim(), color);
      const newTag = { id: Date.now().toString(), name: newTagName.trim(), color };
      handleUpdateTask({ tags: [...task.tags, newTag.id] });
      setNewTagName('');
      setShowAddTag(false);
    }
  };

  const toggleTag = (tagId: string) => {
    const newTags = task.tags.includes(tagId)
      ? task.tags.filter(t => t !== tagId)
      : [...task.tags, tagId];
    handleUpdateTask({ tags: newTags });
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubTask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleSidebarToggleSub = (subtaskId: string) => {
    const sub = task.subTasks.find(s => s.id === subtaskId);
    if (!sub) return;
    playClickSound(sub.completed ? 'uncheck' : 'check');
    const wasCompleted = sub.completed;
    toggleSubTask(task.id, subtaskId);
    setTimeout(() => {
      const currentOrder = task.subTasks.map(s => s.id);
      const others = currentOrder.filter(id => id !== subtaskId);
      if (!wasCompleted) {
        // Now checked → bottom
        reorderSubTasks(task.id, [...others, subtaskId]);
      } else {
        // Now unchecked → bottom of unchecked
        const uncheckedIds = others.filter(id => {
          const st = task.subTasks.find(s => s.id === id);
          return st && !st.completed;
        });
        const checkedIds = others.filter(id => {
          const st = task.subTasks.find(s => s.id === id);
          return st && st.completed;
        });
        reorderSubTasks(task.id, [...uncheckedIds, subtaskId, ...checkedIds]);
      }
    }, 150);
  };

  const completedSubtasks = task.subTasks.filter(st => st.completed).length;

  return (
    <aside 
      className="w-80 shrink-0 flex flex-col border-l overflow-hidden transition-colors duration-300"
      style={{ 
        backgroundColor: theme.sidebar,
        borderColor: theme.border,
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 h-12 shrink-0 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMyDay(task.id)}
            className="btn-icon w-8 h-8 rounded"
            style={{ color: task.myDay ? '#ffc107' : theme.textSecondary }}
            title="Add to My Day"
          >
            <Sun size={18} />
          </button>
          <button
            onClick={() => toggleImportant(task.id)}
            className="btn-icon w-8 h-8 rounded"
            style={{ color: task.important ? '#ffc107' : theme.textSecondary }}
            title="Mark as important"
          >
            <Star size={18} fill={task.important ? '#ffc107' : 'none'} />
          </button>
        </div>
        <button
          onClick={() => setSelectedTaskId(null)}
          className="btn-icon w-8 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.textSecondary }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className={`mt-1 shrink-0 w-6 h-6 flex items-center justify-center lego-stud ${task.completed ? 'checked' : 'unchecked'}`}
            style={{
              backgroundColor: task.completed ? '#C91A09' : '#E5E7EB',
              boxShadow: task.completed 
                ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(201,26,9,0.3)' 
                : 'inset 0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            }}
          >
            {task.completed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <input
            type="text"
            value={task.title}
            onChange={(e) => handleUpdateTask({ title: e.target.value })}
            className="flex-1 text-base font-medium bg-transparent outline-none"
            style={{ 
              color: task.completed ? theme.textSecondary : theme.text,
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Due date
          </label>
          <input
            type="date"
            value={task.dueDate || ''}
            onChange={(e) => handleUpdateTask({ dueDate: e.target.value || undefined })}
            className="input-field text-sm"
            style={{ 
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          />
        </div>

        {/* Reminder */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Reminder
          </label>
          <input
            type="datetime-local"
            value={task.reminder || ''}
            onChange={(e) => handleUpdateTask({ reminder: e.target.value || undefined })}
            className="input-field text-sm"
            style={{ 
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          />
        </div>

        {/* Recurrence */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Repeat
          </label>
          <select
            value={task.recurrence}
            onChange={(e) => handleUpdateTask({ recurrence: e.target.value as Recurrence })}
            className="input-field text-sm appearance-none cursor-pointer"
            style={{ 
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            {RECURRENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => handleUpdateTask({ priority: p.value })}
                className="flex-1 py-2 px-3 rounded-md text-xs font-medium border-2 transition-all duration-150"
                style={{
                  borderColor: task.priority === p.value ? p.color : theme.border,
                  backgroundColor: task.priority === p.value ? p.color + '15' : theme.bg,
                  color: task.priority === p.value ? p.color : theme.textSecondary,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-150 border"
                style={{
                  borderColor: task.tags.includes(tag.id) ? tag.color : theme.border,
                  backgroundColor: task.tags.includes(tag.id) ? tag.color + '20' : theme.bg,
                  color: tag.color,
                }}
              >
                <Hash size={10} />
                {tag.name}
              </button>
            ))}
          </div>
          {showAddTag ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
                className="flex-1 input-field text-sm"
                style={{ 
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: theme.accent }}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTag(true)}
              className="flex items-center gap-1 text-xs font-medium mt-2"
              style={{ color: theme.accent }}
            >
              <Plus size={12} />
              Add tag
            </button>
          )}
        </div>

        {/* Subtasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
              Steps
            </label>
            <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>
              {completedSubtasks}/{task.subTasks.length}
            </span>
          </div>
          <div className="space-y-1">
            {task.subTasks.map((subtask, index) => {
              const brickColor = SUBTASK_COLORS[index % SUBTASK_COLORS.length];
              return (
                <div
                  key={subtask.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl group lego-brick step-brick-row ${subtask.completed ? 'step-brick-checked' : ''}`}
                  style={{ backgroundColor: `${brickColor}18`, borderRadius: '10px' }}
                >
                  <button
                    onClick={() => handleSidebarToggleSub(subtask.id)}
                    className={`shrink-0 w-5 h-5 flex items-center justify-center lego-stud ${subtask.completed ? 'checked' : 'unchecked'}`}
                    style={{
                      backgroundColor: subtask.completed ? brickColor : '#E5E7EB',
                      boxShadow: subtask.completed
                        ? `inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px ${brickColor}50`
                        : 'inset 0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                  {subtask.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                {editingSubtaskId === subtask.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onBlur={() => {
                        if (editingSubtaskTitle.trim()) {
                          updateSubTaskTitle(task.id, subtask.id, editingSubtaskTitle.trim());
                        }
                        setEditingSubtaskId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingSubtaskTitle.trim()) {
                            updateSubTaskTitle(task.id, subtask.id, editingSubtaskTitle.trim());
                          }
                          setEditingSubtaskId(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingSubtaskId(null);
                        }
                      }}
                      className="flex-1 text-sm outline-none bg-transparent border-b px-1 py-0.5"
                      style={{ borderColor: theme.accent, color: theme.text }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (editingSubtaskTitle.trim()) {
                          updateSubTaskTitle(task.id, subtask.id, editingSubtaskTitle.trim());
                        }
                        setEditingSubtaskId(null);
                      }}
                      className="btn-icon w-5 h-5 rounded"
                      style={{ color: theme.accent }}
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className="flex-1 text-sm transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 rounded"
                      style={{
                        color: subtask.completed ? theme.textSecondary : theme.text,
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                      }}
                      onClick={() => {
                        setEditingSubtaskId(subtask.id);
                        setEditingSubtaskTitle(subtask.title);
                      }}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => {
                        setEditingSubtaskId(subtask.id);
                        setEditingSubtaskTitle(subtask.title);
                      }}
                      className="opacity-0 group-hover:opacity-100 btn-icon w-5 h-5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-opacity"
                      style={{ color: theme.textSecondary }}
                    >
                      <Pencil size={10} />
                    </button>
                  </>
                )}
                  <button
                    onClick={() => deleteSubTask(task.id, subtask.id)}
                    className="opacity-0 group-hover:opacity-100 btn-icon w-6 h-6 rounded hover:bg-red-500/10 transition-opacity"
                    style={{ color: '#d83b01' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          {showAddSubtask ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a step"
                className="flex-1 input-field text-sm"
                style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') { setShowAddSubtask(false); setNewSubtaskTitle(''); }
                }}
                autoFocus
              />
              <button onClick={handleAddSubtask} className="px-3 py-1.5 rounded-md text-sm font-medium text-white" style={{ backgroundColor: theme.accent }}>
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddSubtask(true)} className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: theme.accent }}>
              <Plus size={16} />
              Add step
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
            Notes
          </label>
          <textarea
            ref={textareaRef}
            value={task.notes}
            onChange={(e) => handleUpdateTask({ notes: e.target.value })}
            placeholder="Add a note..."
            className="w-full px-3 py-2 rounded-md border outline-none resize-none text-sm transition-all"
            style={{ 
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
              minHeight: '80px',
            }}
          />
        </div>

        {/* Created */}
        <div 
          className="text-xs pt-4 border-t"
          style={{ 
            color: theme.textSecondary,
            borderColor: theme.border,
          }}
        >
          Created {format(parseISO(task.createdAt), 'MMM d, yyyy')}
        </div>

        {/* Delete */}
        <button
          onClick={() => { deleteTask(task.id); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
          Delete task
        </button>
      </div>
    </aside>
  );
}
