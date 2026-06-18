import { useRef, useState, useEffect } from 'react';

const LEGO_COLORS = [
  '#C91A09', // Red
  '#0055BF', // Blue
  '#237841', // Green
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#E91E63', // Pink
];

export interface LegoStackProps {
  subTasks: { id: string; title: string; completed: boolean }[];
  onToggle?: (id: string) => void;
  bgColor?: string;
}

export default function LegoStack({ subTasks, onToggle, bgColor = '#f5f5f5' }: LegoStackProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [stackingIds, setStackingIds] = useState<Set<string>>(new Set());
  const prevCompletedRef = useRef(0);
  const allCompletedRef = useRef(false);

  const completedCount = subTasks.filter(s => s.completed).length;
  const total = subTasks.length;
  const allCompleted = total > 0 && completedCount === total;

  // Detect when a subtask was just completed
  useEffect(() => {
    if (completedCount > prevCompletedRef.current && completedCount <= total) {
      // Find the most recently completed subtask
      const newlyCompleted = subTasks.filter(s => s.completed).slice(-1)[0];
      if (newlyCompleted) {
        setStackingIds(prev => new Set(prev).add(newlyCompleted.id));
        setTimeout(() => {
          setStackingIds(prev => {
            const next = new Set(prev);
            next.delete(newlyCompleted.id);
            return next;
          });
        }, 600);
      }
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, subTasks, total]);

  // Detect when ALL subtasks just became complete
  useEffect(() => {
    if (allCompleted && !allCompletedRef.current && total > 1) {
      setJustCompleted(true);
      setTimeout(() => {
        setBreaking(true);
        setTimeout(() => {
          setBreaking(false);
          setJustCompleted(false);
        }, 1200);
      }, 400);
    }
    allCompletedRef.current = allCompleted;
  }, [allCompleted, total]);

  if (total === 0) return null;

  const getBrickColor = (index: number) => LEGO_COLORS[index % LEGO_COLORS.length];

  return (
    <div className="space-y-3">
      {/* Brick Stack Visualization */}
      {total > 0 && (
        <div
          className={`relative flex flex-col items-center justify-end min-h-[${Math.max(60, total * 18)}px] py-2 px-4 rounded-xl transition-all duration-300 ${justCompleted ? 'lego-tower-complete' : ''}`}
          style={{
            backgroundColor: bgColor,
            minHeight: `${Math.max(60, total * 22 + 20)}px`,
          }}
        >
          {/* Stack Label */}
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B7B8C' }}>
            {allCompleted && !breaking ? '🏆 Tower Complete!' : `Brick Stack ${completedCount}/${total}`}
          </div>

          {/* The Brick Tower */}
          <div className={`relative flex flex-col-reverse items-center gap-[2px] transition-all duration-300 ${breaking ? 'lego-tower-break' : ''}`}>
            {subTasks.map((sub, i) => {
              const color = getBrickColor(i);
              const isChecked = sub.completed;
              const isStacking = stackingIds.has(sub.id);
              const isBroken = breaking;

              return (
                <div
                  key={sub.id}
                  className={`
                    relative flex items-center justify-center font-bold text-white text-xs
                    ${isChecked ? (isBroken ? 'lego-brick-fly' : 'lego-brick-stack') : 'lego-brick-hidden'}
                    ${isStacking ? 'lego-brick-land' : ''}
                  `}
                  onClick={() => onToggle?.(sub.id)}
                  style={{
                    width: isChecked ? '120px' : '0px',
                    height: isChecked ? '18px' : '0px',
                    backgroundColor: color,
                    borderRadius: '4px',
                    boxShadow: isChecked && !isBroken
                      ? `0 2px 0 ${darken(color, 30)}, 0 4px 6px rgba(0,0,0,0.15)`
                      : 'none',
                    opacity: isChecked ? 1 : 0,
                    cursor: onToggle ? 'pointer' : 'default',
                    transformOrigin: 'center bottom',
                    animationDelay: isBroken ? `${Math.random() * 0.3}s` : `${i * 0.08}s`,
                  }}
                  title={sub.title}
                >
                  {/* Stud bumps on top */}
                  <div className="absolute -top-[3px] left-3 w-3 h-[3px] rounded-t-sm" style={{ backgroundColor: lighten(color, 15) }} />
                  <div className="absolute -top-[3px] right-3 w-3 h-[3px] rounded-t-sm" style={{ backgroundColor: lighten(color, 15) }} />

                  {/* Brick shine */}
                  <div className="absolute top-0 left-0 right-0 h-[5px] rounded-t-sm" style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)` }} />

                  {/* Text on brick */}
                  <span className="truncate px-2 max-w-[110px] text-[10px] drop-shadow-sm">
                    {sub.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Base plate */}
          <div
            className="w-32 h-[6px] rounded-sm mt-[2px]"
            style={{
              backgroundColor: '#333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Utility functions for color manipulation
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
