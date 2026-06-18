export type Priority = 'low' | 'normal' | 'high';
export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  reminder?: string;
  recurrence: Recurrence;
  priority: Priority;
  notes: string;
  subTasks: SubTask[];
  tags: string[];
  listId: string;
  myDay: boolean;
  important: boolean;
  createdAt: string;
  order: number;
}

export interface TodoList {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isSmart: boolean;
  filter?: (task: Task) => boolean;
}

export interface Theme {
  id: string;
  name: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  bg: string;
  sidebar: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  isDark: boolean;
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag1', name: 'Work', color: '#0078d4' },
  { id: 'tag2', name: 'Personal', color: '#107c10' },
  { id: 'tag3', name: 'Shopping', color: '#d83b01' },
  { id: 'tag4', name: 'Health', color: '#8764b8' },
];

export const THEMES: Theme[] = [
  {
    id: 'light-blue',
    name: 'Light Blue',
    accent: '#0078d4',
    accentLight: '#e6f2fb',
    accentDark: '#005a9e',
    bg: '#f5f5f5',
    sidebar: '#ffffff',
    card: '#ffffff',
    text: '#252423',
    textSecondary: '#605e5c',
    border: '#e1dfdd',
    isDark: false,
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    accent: '#4fc3f7',
    accentLight: '#1e3a5f',
    accentDark: '#81d4fa',
    bg: '#1f1f1f',
    sidebar: '#252423',
    card: '#323130',
    text: '#ffffff',
    textSecondary: '#a19f9d',
    border: '#484644',
    isDark: true,
  },
  {
    id: 'light-green',
    name: 'Light Green',
    accent: '#107c10',
    accentLight: '#e8f5e9',
    accentDark: '#0b5e0b',
    bg: '#f5f5f5',
    sidebar: '#ffffff',
    card: '#ffffff',
    text: '#252423',
    textSecondary: '#605e5c',
    border: '#e1dfdd',
    isDark: false,
  },
  {
    id: 'light-purple',
    name: 'Light Purple',
    accent: '#8764b8',
    accentLight: '#f0e6ff',
    accentDark: '#6b4c9a',
    bg: '#f5f5f5',
    sidebar: '#ffffff',
    card: '#ffffff',
    text: '#252423',
    textSecondary: '#605e5c',
    border: '#e1dfdd',
    isDark: false,
  },
];
