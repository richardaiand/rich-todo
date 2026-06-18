import { useState, useRef, useCallback } from 'react';
import { Plus, Sun, Star, Calendar, Home, MoreHorizontal, Trash2, Bell, Repeat, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { format, isToday, isTomorrow, parseISO, isPast } from 'date-fns';

const LIST_ICONS: Record<string, React.ReactNode> = {
  'my-day': <Sun size={24} />,
  'important': <Star size={24} />,
  'planned': <Calendar size={24} />,
  'all': <Home size={24} />,
};

const LIST_GRADIENTS: Record<string, string> = {
  'my-day': 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
  'important': 'linear-gradient(135deg, #C91A09 0%, #8B0000 100%)',
  'planned': 'linear-gradient(135deg, #0055BF 0%, #00BCD4 100%)',
  'all': 'linear-gradient(135deg, #237841 0%, #4CAF50 100%)',
};

// Floating stud animation element
interface FloatingStud {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: number;
  tx2: number;
  targetY: number;
}

let studIdCounter = 0;

export default function TaskList() {
  const { 
    tasks, lists, tags, currentListId, selectedTaskId, setSelectedTaskId,
    addTask, deleteTask, toggleTaskComplete, toggleMyDay, toggleImportant,
    addSubTask, toggleSubTask, deleteSubTask,
    getFilteredTasks, theme, incrementStudTotal
  } = useTodos();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [floatingStuds, setFloatingStuds] = useState<FloatingStud[]>([]);
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [showSubtaskInput, setShowSubtaskInput] = useState<Record<string, boolean>>({});
  const studTimeoutRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const currentList = lists.find(l => l.id === currentListId);
  const filteredTasks = getFilteredTasks();
  const completedTasks = tasks.filter(t => {
    if (currentListId === 'my-day') return t.completed && t.myDay;
    if (currentListId === 'important') return t.completed && t.important;
    if (currentListId === 'planned') return t.completed && t.dueDate;
    if (currentListId === 'all') return t.completed;
    return t.completed && t.listId === currentListId;
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const getDueDateLabel = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = parseISO(dueDate);
    if (isToday(date)) return { text: 'Today', color: theme.accent };
    if (isTomorrow(date)) return { text: 'Tomorrow', color: theme.accent };
    if (isPast(date) && !isToday(date)) return { text: format(date, 'MMM d'), color: '#d83b01' };
    return { text: format(date, 'MMM d'), color: theme.textSecondary };
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.order || 0) - (b.order || 0);
  });

  // Create floating stud popup animation
  const spawnStudPopup = useCallback((rect: DOMRect, color: string = '#C91A09') => {
    const id = ++studIdCounter;
    // Random drift direction
    const tx = 10 + Math.random() * 40;
    const tx2 = -20 + Math.random() * 40;
    const targetY = -(window.innerHeight * 0.4 + Math.random() * 100);
    
    const newStud: FloatingStud = {
      id, x: rect.left + rect.width / 2 - 10, y: rect.top + rect.height / 2 - 10,
      color, tx, tx2, targetY,
    };
    
    setFloatingStuds(prev => [...prev, newStud]);
    incrementStudTotal();
    
    // Clean up after animation
    const timeout = setTimeout(() => {
      setFloatingStuds(prev => prev.filter(s => s.id !== id));
      delete studTimeoutRefs.current[id];
    }, 1300);
    studTimeoutRefs.current[id] = timeout;
  }, [incrementStudTotal]);

  const handleToggleComplete = (taskId: string, e: React.MouseEvent | React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.completed) {
      // Task is being completed - spawn stud popup
      spawnStudPopup(rect, '#C91A09');
    }
    toggleTaskComplete(taskId);
  };

  const handleToggleSub = (taskId: string, subTaskId: string, e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const task = tasks.find(t => t.id === taskId);
    const sub = task?.subTasks.find(s => s.id === subTaskId);
    
    if (sub && !sub.completed) {
      spawnStudPopup(rect, '#0055BF');
    }
    toggleSubTask(taskId, subTaskId);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleAddSubtask = (taskId: string) => {
    const title = subtaskInputs[taskId]?.trim();
    if (title) {
      addSubTask(taskId, title);
      setSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
      setShowSubtaskInput(prev => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <main 
      className="flex-1 flex flex-col min-w-0 transition-colors duration-300 relative"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Floating Studs Overlay */}
      {floatingStuds.map(stud => (
        <div
          key={stud.id}
          className="stud-popup"
          style={{
            left: stud.x,
            top: stud.y,
            backgroundColor: stud.color,
            '--tx': `${stud.tx}px`,
            '--tx2': `${stud.tx2}px`,
            '--target-y': `${stud.targetY}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* List Header - Studded Background */}
      <div 
        className="px-6 pt-6 pb-4 shrink-0 studded-bg relative"
        style={{
          background: currentList && LIST_GRADIENTS[currentList.id] 
            ? LIST_GRADIENTS[currentList.id] 
            : currentList?.color,
        }}
      >
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <div className="text-white/90">
            {currentList && LIST_ICONS[currentList.id]}
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            {currentList?.name || 'Tasks'}
          </h1>
        </div>
        <p className="relative z-10 text-white/80 text-sm drop-shadow">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Add Task Button */}
        {!showAddTask ? (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed mb-4 transition-all duration-200 hover:border-solid"
            style={{ 
              borderColor: theme.border,
              color: theme.accent,
            }}
          >
            <Plus size={20} />
            <span className="text-sm font-medium">Add a task</span>
          </button>
        ) : (
          <div 
            className="mb-4 p-4 rounded-lg border space-y-3"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: theme.id === 'lego' ? '12px' : '8px',
            }}
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task"
              className="input-field text-base"
              style={{ 
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') { setShowAddTask(false); setNewTaskTitle(''); }
              }}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  className="btn-icon w-7 h-7 rounded"
                  style={{ color: theme.textSecondary }}
                  onClick={() => {}}
                >
                  <Calendar size={16} />
                </button>
                <button
                  className="btn-icon w-7 h-7 rounded"
                  style={{ color: theme.textSecondary }}
                  onClick={() => {}}
                >
                  <Repeat size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddTask(false); setNewTaskTitle(''); }}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{ color: theme.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: theme.accent }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-2">
          {sortedTasks.map(task => {
            const dueLabel = getDueDateLabel(task.dueDate);
            const isExpanded = expandedTaskId === task.id;
            const hasSubtasks = task.subTasks.length > 0;
            const completedSubtasks = task.subTasks.filter(st => st.completed).length;
            const isEditing = selectedTaskId === task.id;

            return (
              <div key={task.id} className="task-appear">
                {/* Main Task Row */}
                <div
                  className="group relative flex items-start gap-3 px-4 py-3 rounded-xl border lego-brick"
                  style={{
                    backgroundColor: isEditing ? theme.accentLight : theme.card,
                    borderColor: isEditing ? theme.accent : theme.border,
                    borderRadius: theme.id === 'lego' ? '12px' : '8px',
                  }}
                >
                  {/* Checkbox - Lego Stud Style */}
                  <button
                    onClick={(e) => handleToggleComplete(task.id, e)}
                    className={`mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center lego-stud ${task.completed ? 'checked' : 'unchecked'}`}
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

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-medium truncate transition-all duration-150"
                      style={{
                        color: task.completed ? theme.textSecondary : theme.text,
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {dueLabel && (
                        <span 
                          className="text-xs flex items-center gap-1"
                          style={{ color: dueLabel.color }}
                        >
                          <Calendar size={10} />
                          {dueLabel.text}
                        </span>
                      )}
                      {task.recurrence !== 'none' && (
                        <span style={{ color: theme.textSecondary }}>
                          <Repeat size={10} />
                        </span>
                      )}
                      {task.reminder && (
                        <span style={{ color: theme.textSecondary }}>
                          <Bell size={10} />
                        </span>
                      )}
                      {hasSubtasks && (
                        <span 
                          className="text-xs flex items-center gap-1 cursor-pointer hover:underline"
                          style={{ color: theme.textSecondary }}
                          onClick={() => toggleExpand(task.id)}
                        >
                          {completedSubtasks}/{task.subTasks.length} steps
                        </span>
                      )}
                      {task.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <span 
                            key={tagId}
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Steps Expand Toggle (if has subtasks) */}
                    {hasSubtasks && (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="btn-icon w-7 h-7 rounded transition-colors"
                        style={{ color: theme.textSecondary }}
                        title="Toggle steps"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => setSelectedTaskId(isEditing ? null : task.id)}
                      className="btn-icon w-7 h-7 rounded hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ 
                        color: isEditing ? theme.accent : theme.textSecondary,
                        backgroundColor: isEditing ? theme.accent + '15' : 'transparent',
                      }}
                      title="Edit task"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Important Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImportant(task.id);
                      }}
                      className="btn-icon w-7 h-7 rounded"
                      style={{ color: task.important ? '#ffc107' : theme.textSecondary }}
                    >
                      <Star size={16} fill={task.important ? '#ffc107' : 'none'} />
                    </button>

                    {/* My Day Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMyDay(task.id);
                      }}
                      className="btn-icon w-7 h-7 rounded"
                      style={{ color: task.myDay ? '#ffc107' : theme.textSecondary }}
                    >
                      <Sun size={16} />
                    </button>

                    {/* More Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuTaskId(menuTaskId === task.id ? null : task.id);
                        }}
                        className="btn-icon w-7 h-7 rounded"
                        style={{ color: theme.textSecondary }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuTaskId === task.id && (
                        <div 
                          className="absolute right-0 top-8 z-10 w-40 py-1 rounded-lg border shadow-lg"
                          style={{ 
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                          }}
                        >
                          <button
                            onClick={() => { deleteTask(task.id); setMenuTaskId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Steps Dropdown - Inline on task bar */}
                <div className={`task-dropdown ${isExpanded ? 'open' : ''}`}>
                  <div 
                    className="mx-2 mt-1 mb-2 p-3 rounded-xl border space-y-2"
                    style={{ 
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      borderRadius: '10px',
                    }}
                  >
                    {/* Step Label */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                        Steps
                      </span>
                      <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>
                        {completedSubtasks}/{task.subTasks.length}
                      </span>
                    </div>

                    {/* Step List */}
                    <div className="space-y-1">
                      {task.subTasks.map(subtask => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <button
                            onClick={(e) => handleToggleSub(task.id, subtask.id, e)}
                            className={`shrink-0 w-4 h-4 flex items-center justify-center lego-stud ${subtask.completed ? 'checked' : 'unchecked'}`}
                            style={{
                              backgroundColor: subtask.completed ? '#0055BF' : '#D1D5DB',
                              boxShadow: subtask.completed
                                ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.15)'
                                : 'inset 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                            }}
                          >
                            {subtask.completed && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          <span
                            className="flex-1 text-sm"
                            style={{
                              color: subtask.completed ? theme.textSecondary : theme.text,
                              textDecoration: subtask.completed ? 'line-through' : 'none',
                            }}
                          >
                            {subtask.title}
                          </span>
                          <button
                            onClick={() => deleteSubTask(task.id, subtask.id)}
                            className="opacity-0 group-hover:opacity-100 btn-icon w-5 h-5 rounded hover:bg-red-500/10 transition-opacity"
                            style={{ color: '#d83b01' }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Subtask Inline */}
                    {showSubtaskInput[task.id] ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={subtaskInputs[task.id] || ''}
                          onChange={(e) => setSubtaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Add a step"
                          className="flex-1 input-field text-sm"
                          style={{ 
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            color: theme.text,
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubtask(task.id);
                            if (e.key === 'Escape') setShowSubtaskInput(prev => ({ ...prev, [task.id]: false }));
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddSubtask(task.id)}
                          className="px-2 py-1 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: '#0055BF' }}
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSubtaskInput(prev => ({ ...prev, [task.id]: true }))}
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: '#0055BF' }}
                      >
                        <Plus size={12} />
                        Add step
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <div 
              className="text-xs font-bold uppercase tracking-wider px-4 py-2"
              style={{ color: theme.textSecondary }}
            >
              Completed ({completedTasks.length})
            </div>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 px-4 py-2.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity lego-brick lego-brick-complete"
                  style={{ backgroundColor: theme.card, borderRadius: '12px' }}
                >
                  <button
                    onClick={(e) => handleToggleComplete(task.id, e)}
                    className="mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center lego-stud checked"
                    style={{
                      backgroundColor: '#C91A09',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(201,26,9,0.3)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <div 
                    className="flex-1 text-sm line-through"
                    style={{ color: theme.textSecondary }}
                  >
                    {task.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !showAddTask && (
          <div className="flex flex-col items-center justify-center py-16">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.accentLight }}
            >
              <Calendar size={32} style={{ color: theme.accent }} />
            </div>
            <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
              No tasks yet
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              Add a task to get started
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
