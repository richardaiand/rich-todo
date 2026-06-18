import { useState } from 'react';
import { Sun, Star, Calendar, Home, List, Plus, Trash2, X } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { TodoList } from '../types';

const ICONS: Record<string, React.ReactNode> = {
  sun: <Sun size={18} />,
  star: <Star size={18} />,
  calendar: <Calendar size={18} />,
  home: <Home size={18} />,
  list: <List size={18} />,
};

export default function Sidebar() {
  const { 
    lists, currentListId, setCurrentListId, setSelectedTaskId,
    getTodayCount, getImportantCount, getPlannedCount,
    addList, deleteList, theme 
  } = useTodos();
  
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#0078d4');

  const todayCount = getTodayCount();
  const importantCount = getImportantCount();
  const plannedCount = getPlannedCount();

  const getCount = (list: TodoList) => {
    if (list.id === 'my-day') return todayCount;
    if (list.id === 'important') return importantCount;
    if (list.id === 'planned') return plannedCount;
    return undefined;
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim(), newListColor);
      setNewListName('');
      setShowNewList(false);
    }
  };

  const colors = ['#0078d4', '#107c10', '#d83b01', '#8764b8', '#ffc107', '#00b7c3', '#e3008c'];

  return (
    <aside 
      className="w-60 shrink-0 flex flex-col border-r transition-colors duration-300"
      style={{ 
        backgroundColor: theme.sidebar, 
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-0.5 px-2">
          {lists.map(list => {
            const isActive = currentListId === list.id;
            const count = getCount(list);
            
            return (
              <div key={list.id} className="group relative">
                <button
                  onClick={() => {
                    setCurrentListId(list.id);
                    setSelectedTaskId(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? theme.accentLight : 'transparent',
                    color: isActive ? theme.accent : theme.text,
                  }}
                >
                  <span style={{ color: list.color }}>
                    {ICONS[list.icon] || <List size={18} />}
                  </span>
                  <span className="flex-1 text-left font-medium truncate">
                    {list.name}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span 
                      className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: isActive ? theme.accent : theme.border,
                        color: isActive ? '#fff' : theme.textSecondary,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
                {!list.isDefault && (
                  <button
                    onClick={() => deleteList(list.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 btn-icon w-6 h-6 hover:bg-red-500/10 rounded"
                    style={{ color: '#d83b01' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-4 px-3">
          <button
            onClick={() => setShowNewList(!showNewList)}
            className="flex items-center gap-2 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color: theme.accent }}
          >
            <Plus size={16} />
            New list
          </button>
        </div>

        {showNewList && (
          <div 
            className="mx-3 mt-2 p-3 rounded-lg border space-y-3"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Create List</span>
              <button 
                onClick={() => setShowNewList(false)}
                className="btn-icon w-6 h-6 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                style={{ color: theme.textSecondary }}
              >
                <X size={14} />
              </button>
            </div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className="input-field text-sm"
              style={{ 
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setNewListColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: c,
                    borderColor: newListColor === c ? theme.text : 'transparent',
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleAddList}
              disabled={!newListName.trim()}
              className="w-full py-1.5 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: theme.accent }}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
