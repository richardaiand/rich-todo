import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Sun, Moon, Settings, X, Menu, CheckCircle2, Circle } from 'lucide-react';
import { useTodos } from '../context/TodoContext';

interface HeaderProps {
  onOpenTheme: () => void;
}

export default function Header({ onOpenTheme }: HeaderProps) {
  const { theme, searchQuery, setSearchQuery, setSelectedTaskId, setCurrentListId, studTotal, tasks, lists, tags } = useTodos();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search across all tasks
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter(t => {
      if (t.title.toLowerCase().includes(q)) return true;
      if (t.notes.toLowerCase().includes(q)) return true;
      if (t.subTasks.some(st => st.title.toLowerCase().includes(q))) return true;
      if (t.tags.some(tagId => {
        const tag = tags.find(tg => tg.id === tagId);
        return tag?.name.toLowerCase().includes(q);
      })) return true;
      return false;
    }).slice(0, 8); // max 8 results
  }, [tasks, tags, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (taskId: string, listId: string) => {
    // Find list; fallback to 'all' if list doesn't exist
    const listExists = lists.find(l => l.id === listId);
    setCurrentListId(listExists ? listId : 'all');
    setSelectedTaskId(taskId);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const getListName = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list?.name || 'All';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    if (e.target.value) setSelectedTaskId(null);
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim()) setShowDropdown(true);
  };

  return (
    <header 
      className="flex items-center justify-between px-4 h-12 shrink-0 border-b transition-colors duration-300 relative z-50"
      style={{ 
        backgroundColor: theme.sidebar, 
        borderColor: theme.border,
      }}
    >
      <div className="flex items-center gap-3">
        <button 
          className="btn-icon w-8 h-8 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.textSecondary }}
          onClick={() => {}}
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-sm tracking-wide">BRICKLIST</span>
      </div>

      <div className="flex-1 max-w-xl mx-4 relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-2 px-3 h-8 rounded-md transition-all duration-200 border"
          style={{ 
            backgroundColor: theme.bg,
            borderColor: isSearchFocused ? theme.accent : theme.border,
          }}
        >
          <Search size={16} style={{ color: theme.textSecondary }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across all tasks..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={() => {
              // Delay so click on dropdown items still works
              setTimeout(() => setIsSearchFocused(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowDropdown(false);
                setSearchQuery('');
              }
            }}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="btn-icon w-5 h-5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-10 rounded-lg border shadow-lg overflow-hidden"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div 
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b"
              style={{ color: theme.textSecondary, borderColor: theme.border }}
            >
              Results ({searchResults.length})
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map(task => {
                const listName = getListName(task.listId);
                return (
                  <button
                    key={task.id}
                    onClick={() => handleResultClick(task.id, task.listId)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-b-0"
                    style={{ borderColor: theme.border }}
                  >
                    {/* Completion icon */}
                    <div className="shrink-0">
                      {task.completed ? (
                        <CheckCircle2 size={16} style={{ color: theme.accent }} />
                      ) : (
                        <Circle size={16} style={{ color: theme.textSecondary }} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-sm font-medium truncate"
                        style={{ 
                          color: task.completed ? theme.textSecondary : theme.text,
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          {listName}
                        </span>
                        {task.subTasks.length > 0 && (
                          <span className="text-xs" style={{ color: theme.textSecondary }}>
                            {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length} steps
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showDropdown && searchQuery.trim() && searchResults.length === 0 && (
          <div 
            className="absolute left-0 right-0 top-10 rounded-lg border shadow-lg p-4 text-center"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              No tasks found
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Stud Total Counter */}
        <div 
          className="stud-counter-target flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold stud-total-pop"
          style={{ 
            backgroundColor: '#C91A09',
            color: 'white',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.15)',
          }}
          key={studTotal}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(255,255,255,0.1) 50%, transparent 70%)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
          <span>{studTotal}</span>
        </div>

        <button 
          className="btn-icon w-8 h-8 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.textSecondary }}
          onClick={onOpenTheme}
        >
          {theme.isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button 
          className="btn-icon w-8 h-8 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.textSecondary }}
          onClick={onOpenTheme}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
