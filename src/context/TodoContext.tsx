import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TodoList, Tag, Theme, DEFAULT_TAGS, THEMES } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, addDays, isToday, isPast, parseISO } from 'date-fns';

interface TodoContextType {
  tasks: Task[];
  lists: TodoList[];
  tags: Tag[];
  currentListId: string;
  selectedTaskId: string | null;
  theme: Theme;
  searchQuery: string;
  
  // Actions
  setCurrentListId: (id: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setTheme: (theme: Theme) => void;
  
  studTotal: number;
  incrementStudTotal: () => void;
  decrementStudTotal: () => void;
  
  // Task CRUD
  addTask: (title: string, listId?: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleMyDay: (id: string) => void;
  toggleImportant: (id: string) => void;
  
  // Subtasks
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  reorderSubTasks: (taskId: string, subTaskIds: string[]) => void;
  updateSubTaskTitle: (taskId: string, subTaskId: string, title: string) => void;
  
  // Lists
  addList: (name: string, color: string) => void;
  deleteList: (id: string) => void;
  
  // Tags
  addTag: (name: string, color: string) => void;
  
  // Helpers
  getFilteredTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByList: (listId: string) => Task[];
  getOverdueCount: () => number;
  getTodayCount: () => number;
  getImportantCount: () => number;
  getPlannedCount: () => number;
  getCompletedTasksCount: () => number;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

function getDefaultLists(): TodoList[] {
  return [
    { id: 'my-day', name: 'My Day', icon: 'sun', color: '#FFC107', isDefault: true, isSmart: true },
    { id: 'important', name: 'Important', icon: 'star', color: '#C91A09', isDefault: true, isSmart: true },
    { id: 'planned', name: 'Planned', icon: 'calendar', color: '#0055BF', isDefault: true, isSmart: true },
    { id: 'all', name: 'Tasks', icon: 'home', color: '#237841', isDefault: true, isSmart: true },
  ];
}

function getDemoTasks(): Task[] {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');
  
  return [
    {
      id: uuidv4(),
      title: 'Welcome to Rich To Do!',
      completed: false,
      dueDate: today,
      recurrence: 'none',
      priority: 'high',
      notes: 'This is a rich todo app inspired by Outlook To Do. Click on a task to see details.',
      subTasks: [
        { id: uuidv4(), title: 'Try adding a subtask', completed: false },
        { id: uuidv4(), title: 'Set a due date', completed: true },
      ],
      tags: ['tag1'],
      listId: 'all',
      myDay: true,
      important: true,
      createdAt: now.toISOString(),
      order: 0,
    },
    {
      id: uuidv4(),
      title: 'Review project proposal',
      completed: false,
      dueDate: today,
      recurrence: 'none',
      priority: 'high',
      notes: 'Check the budget section carefully.',
      subTasks: [],
      tags: ['tag1'],
      listId: 'all',
      myDay: true,
      important: false,
      createdAt: now.toISOString(),
      order: 1,
    },
    {
      id: uuidv4(),
      title: 'Buy groceries for the week',
      completed: false,
      dueDate: tomorrow,
      recurrence: 'weekly',
      priority: 'normal',
      notes: 'Milk, eggs, bread, vegetables, fruits',
      subTasks: [
        { id: uuidv4(), title: 'Check fridge inventory', completed: true },
        { id: uuidv4(), title: 'Make shopping list', completed: false },
      ],
      tags: ['tag3', 'tag2'],
      listId: 'all',
      myDay: false,
      important: true,
      createdAt: now.toISOString(),
      order: 2,
    },
    {
      id: uuidv4(),
      title: 'Morning jog',
      completed: true,
      completedAt: now.toISOString(),
      dueDate: today,
      recurrence: 'daily',
      priority: 'normal',
      notes: '5km run around the park',
      subTasks: [],
      tags: ['tag4'],
      listId: 'all',
      myDay: true,
      important: false,
      createdAt: now.toISOString(),
      order: 3,
    },
    {
      id: uuidv4(),
      title: 'Schedule dentist appointment',
      completed: false,
      dueDate: format(addDays(now, 3), 'yyyy-MM-dd'),
      recurrence: 'none',
      priority: 'low',
      notes: 'Call Dr. Smith at 555-0123',
      subTasks: [],
      tags: ['tag4'],
      listId: 'all',
      myDay: false,
      important: false,
      createdAt: now.toISOString(),
      order: 4,
    },
  ];
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('rich-todo-tasks', getDemoTasks());
  const [lists, setLists] = useLocalStorage<TodoList[]>('rich-todo-lists', getDefaultLists());
  const [tags, setTags] = useLocalStorage<Tag[]>('rich-todo-tags', DEFAULT_TAGS);
  const [currentListId, setCurrentListId] = useLocalStorage<string>('rich-todo-current-list', 'my-day');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [theme, setTheme] = useLocalStorage<Theme>('rich-todo-theme', THEMES.find(t => t.id === 'lego') || THEMES[0]);
  const [studTotal, setStudTotal] = useLocalStorage<number>('rich-todo-stud-total', 0);
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = lists.find(l => l.id === currentListId);

  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.notes.toLowerCase().includes(q) ||
        t.tags.some(tagId => {
          const tag = tags.find(tg => tg.id === tagId);
          return tag?.name.toLowerCase().includes(q);
        })
      );
    } else if (currentList) {
      if (currentList.id === 'my-day') {
        filtered = tasks.filter(t => t.myDay);
      } else if (currentList.id === 'important') {
        filtered = tasks.filter(t => t.important);
      } else if (currentList.id === 'planned') {
        filtered = tasks.filter(t => t.dueDate && !t.completed);
      } else if (currentList.id === 'all') {
        filtered = tasks.filter(t => !t.completed);
      } else {
        filtered = tasks.filter(t => t.listId === currentList.id);
      }
    }
    
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.important !== b.important) return a.important ? -1 : 1;
      if (a.priority !== b.priority) {
        const p = { high: 0, normal: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return a.order - b.order;
    });
  }, [tasks, currentList, currentListId, searchQuery, tags]);

  const getTaskById = useCallback((id: string) => tasks.find(t => t.id === id), [tasks]);
  const getTasksByList = useCallback((listId: string) => tasks.filter(t => t.listId === listId), [tasks]);

  const getOverdueCount = useCallback(() => {
    return tasks.filter(t => !t.completed && t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length;
  }, [tasks]);

  const getTodayCount = useCallback(() => {
    return tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate))).length;
  }, [tasks]);

  const getImportantCount = useCallback(() => {
    return tasks.filter(t => !t.completed && t.important).length;
  }, [tasks]);

  const getPlannedCount = useCallback(() => {
    return tasks.filter(t => !t.completed && t.dueDate).length;
  }, [tasks]);

  const getCompletedTasksCount = useCallback(() => {
    return tasks.filter(t => t.completed).length;
  }, [tasks]);

  const incrementStudTotal = useCallback(() => {
    setStudTotal(prev => prev + 1);
  }, [setStudTotal]);

  const decrementStudTotal = useCallback(() => {
    setStudTotal(prev => Math.max(0, prev - 1));
  }, [setStudTotal]);

  const addTask = useCallback((title: string, listId?: string) => {
    const targetListId = listId || currentListId;
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      recurrence: 'none',
      priority: 'normal',
      notes: '',
      subTasks: [],
      tags: [],
      listId: targetListId === 'my-day' || targetListId === 'important' || targetListId === 'planned' || targetListId === 'all' 
        ? 'all' 
        : targetListId,
      myDay: currentListId === 'my-day',
      important: currentListId === 'important',
      createdAt: new Date().toISOString(),
      order: tasks.length,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [tasks, currentListId, setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [setTasks, selectedTaskId]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return { 
        ...t, 
        completed, 
        completedAt: completed ? new Date().toISOString() : undefined,
        myDay: completed ? false : t.myDay,
      };
    }));
  }, [setTasks]);

  const toggleMyDay = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, myDay: !t.myDay } : t));
  }, [setTasks]);

  const toggleImportant = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, important: !t.important } : t));
  }, [setTasks]);

  const addSubTask = useCallback((taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subTasks: [...t.subTasks, { id: uuidv4(), title, completed: false }],
      };
    }));
  }, [setTasks]);

  const toggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st),
      };
    }));
  }, [setTasks]);

  const deleteSubTask = useCallback((taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subTasks: t.subTasks.filter(st => st.id !== subTaskId),
      };
    }));
  }, [setTasks]);

  const reorderSubTasks = useCallback((taskId: string, subTaskIds: string[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const ordered = subTaskIds.map(id => t.subTasks.find(st => st.id === id)).filter(Boolean) as typeof t.subTasks;
      return { ...t, subTasks: ordered };
    }));
  }, [setTasks]);

  const updateSubTaskTitle = useCallback((taskId: string, subTaskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, title } : st),
      };
    }));
  }, [setTasks]);

  const addList = useCallback((name: string, color: string) => {
    const newList: TodoList = {
      id: uuidv4(),
      name,
      icon: 'list',
      color,
      isDefault: false,
      isSmart: false,
    };
    setLists(prev => [...prev, newList]);
  }, [setLists]);

  const deleteList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
    if (currentListId === id) setCurrentListId('all');
  }, [setLists, currentListId, setCurrentListId]);

  const addTag = useCallback((name: string, color: string) => {
    const newTag: Tag = { id: uuidv4(), name, color };
    setTags(prev => [...prev, newTag]);
  }, [setTags]);

  const value = useMemo(() => ({
    tasks,
    lists,
    tags,
    currentListId,
    selectedTaskId,
    theme,
    searchQuery,
    setCurrentListId,
    setSelectedTaskId,
    setSearchQuery,
    setTheme,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleMyDay,
    toggleImportant,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    reorderSubTasks,
    updateSubTaskTitle,
    addList,
    deleteList,
    addTag,
    studTotal,
    incrementStudTotal,
    decrementStudTotal,
    getCompletedTasksCount,
    getFilteredTasks,
    getTaskById,
    getTasksByList,
    getOverdueCount,
    getTodayCount,
    getImportantCount,
    getPlannedCount,
  }), [
    tasks, lists, tags, currentListId, selectedTaskId, theme, searchQuery, studTotal,
    addTask, updateTask, deleteTask, toggleTaskComplete, toggleMyDay, toggleImportant,
    addSubTask, toggleSubTask, deleteSubTask, reorderSubTasks, updateSubTaskTitle, addList, deleteList, addTag,
    getFilteredTasks, getTaskById, getTasksByList, getOverdueCount, getTodayCount,
    getImportantCount, getPlannedCount, setCurrentListId, setSearchQuery, setTheme,
    incrementStudTotal, decrementStudTotal, getCompletedTasksCount,
  ]);

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within TodoProvider');
  return context;
}
