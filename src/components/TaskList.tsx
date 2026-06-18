import { useState } from 'react';
import { Plus, Sun, Star, Calendar, Home, MoreHorizontal, Trash2, Bell, Repeat } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { format, isToday, isTomorrow, parseISO, isPast } from 'date-fns';

const LIST_ICONS: Record<string, React.ReactNode> = {
  'my-day': <Sun size={24} />,
  'important': <Star size={24} />,
  'planned': <Calendar size={24} />,
  'all': <Home size={24} />,
};

const LIST_GRADIENTS: Record<string, string> = {
  'my-day': 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
  'important': 'linear-gradient(135deg, #d83b01 0%, #ff5722 100%)',
  'planned': 'linear-gradient(135deg, #0078d4 0%, #00bcd4 100%)',
  'all': 'linear-gradient(135deg, #8764b8 0%, #9c27b0 100%)',
};

export default function TaskList() {
  const { 
    tasks, lists, tags, currentListId, selectedTaskId, setSelectedTaskId,
    addTask, deleteTask, toggleTaskComplete, toggleMyDay, toggleImportant,
    getFilteredTasks, theme
  } = useTodos();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);

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
      const task = addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setShowAddTask(false);
      setSelectedTaskId(task.id);
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

  return (
    <main 
      className="flex-1 flex flex-col min-w-0 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      {/* List Header */}
      <div 
        className="px-6 pt-6 pb-4 shrink-0"
        style={{
          background: currentList && LIST_GRADIENTS[currentList.id] 
            ? LIST_GRADIENTS[currentList.id] 
            : currentList?.color,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="text-white/90">
            {currentList && LIST_ICONS[currentList.id]}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {currentList?.name || 'Tasks'}
          </h1>
        </div>
        <p className="text-white/80 text-sm">
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
        <div className="space-y-1">
          {sortedTasks.map(task => {
            const dueLabel = getDueDateLabel(task.dueDate);
            const isSelected = selectedTaskId === task.id;
            const hasSubtasks = task.subTasks.length > 0;
            const completedSubtasks = task.subTasks.filter(st => st.completed).length;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="group relative flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: isSelected ? theme.accentLight : theme.card,
                  borderColor: isSelected ? theme.accent : theme.border,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskComplete(task.id);
                  }}
                  className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150"
                  style={{
                    borderColor: task.completed ? theme.accent : theme.border,
                    backgroundColor: task.completed ? theme.accent : 'transparent',
                  }}
                >
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                        className="text-xs flex items-center gap-1"
                        style={{ color: theme.textSecondary }}
                      >
                        {completedSubtasks}/{task.subTasks.length}
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
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            );
          })}
        </div>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <div 
              className="text-xs font-semibold uppercase tracking-wider px-4 py-2"
              style={{ color: theme.textSecondary }}
            >
              Completed ({completedTasks.length})
            </div>
            <div className="space-y-1">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 px-4 py-2.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: theme.card }}
                >
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: theme.accent,
                      backgroundColor: theme.accent,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <div 
                    className="text-sm line-through"
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
