import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import QnAComponent from './QnAComponent';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState(() => {
    return JSON.parse(localStorage.getItem('chatHistory')) || [];
  });
  const [currentChat, setCurrentChat] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    setCurrentChat([]);
  };

  const handleLoadChat = (chatMessages) => {
    setCurrentChat(chatMessages);
  };

  const handleSaveChat = (newMessages) => {
    const updatedChats = [...chats, newMessages];
    setChats(updatedChats);
  };

  const handleDeleteChat = (index) => {
    const updatedChats = chats.filter((_, i) => i !== index);
    setChats(updatedChats);

    // Adjust currentChatIndex safely
    if (index === currentChatIndex) {
      setCurrentChatIndex(updatedChats.length - 1);
    } else if (index < currentChatIndex) {
      setCurrentChatIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="App">
      {sidebarOpen && (
        <Sidebar
          chats={chats}
          onSelectChat={handleLoadChat}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen(false)}
          onDeleteChat={handleDeleteChat}
          currentChatIndex={currentChatIndex}
        />
      )}
      <QnAComponent
        currentChat={currentChat}
        onSaveChat={handleSaveChat}
        onToggleSidebar={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
}

export default App;