import { useState } from 'react';
import { TodoProvider, useTodos } from './context/TodoContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import TaskDetails from './components/TaskDetails';
import ThemeModal from './components/ThemeModal';

function AppContent() {
  const { theme, selectedTaskId } = useTodos();
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <div 
      className="flex flex-col h-full transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Header onOpenTheme={() => setShowThemeModal(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <TaskList />
        {selectedTaskId && <TaskDetails />}
      </div>
      {showThemeModal && <ThemeModal onClose={() => setShowThemeModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;
