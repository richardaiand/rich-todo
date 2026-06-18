import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { THEMES } from '../types';

interface ThemeModalProps {
  onClose: () => void;
}

export default function ThemeModal({ onClose }: ThemeModalProps) {
  const { theme, setTheme } = useTodos();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleApply = () => {
    setTheme(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-md mx-4 rounded-xl border shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 className="text-lg font-semibold" style={{ color: theme.text }}>
            Appearance
          </h2>
          <button
            onClick={onClose}
            className="btn-icon w-8 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: theme.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label 
              className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: theme.textSecondary }}
            >
              Themes
            </label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t)}
                  className="relative p-4 rounded-lg border-2 transition-all duration-150 text-left"
                  style={{
                    borderColor: selectedTheme.id === t.id ? t.accent : theme.border,
                    backgroundColor: t.sidebar,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: t.accent }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: t.text }}
                    >
                      {t.name}
                    </span>
                  </div>
                  <div 
                    className="h-8 rounded"
                    style={{ backgroundColor: t.bg }}
                  />
                  {selectedTheme.id === t.id && (
                    <div 
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: t.accent }}
                    >
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: theme.textSecondary }}
            >
              Accent Color
            </label>
            <div className="flex gap-3">
              {['#0078d4', '#107c10', '#d83b01', '#8764b8', '#ffc107', '#00b7c3', '#e3008c', '#ff4081'].map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedTheme({ ...selectedTheme, accent: color, accentDark: color })}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedTheme.accent === color ? theme.text : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div 
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: theme.border }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ color: theme.textSecondary }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
