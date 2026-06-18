import { useState } from 'react';
import { Search, Sun, Moon, Settings, X, Menu } from 'lucide-react';
import { useTodos } from '../context/TodoContext';

interface HeaderProps {
  onOpenTheme: () => void;
}

export default function Header({ onOpenTheme }: HeaderProps) {
  const { theme, searchQuery, setSearchQuery, setSelectedTaskId } = useTodos();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header 
      className="flex items-center justify-between px-4 h-12 shrink-0 border-b transition-colors duration-300"
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
        <span className="font-semibold text-sm">To Do</span>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div 
          className="flex items-center gap-2 px-3 h-8 rounded-md transition-all duration-200 border"
          style={{ 
            backgroundColor: theme.bg,
            borderColor: isSearchFocused ? theme.accent : theme.border,
          }}
        >
          <Search size={16} style={{ color: theme.textSecondary }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setSelectedTaskId(null);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn-icon w-5 h-5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
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
