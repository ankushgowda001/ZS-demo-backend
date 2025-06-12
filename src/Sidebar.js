import React from 'react';
import './styles/Sidebar.css';

const Sidebar = ({ chats, onSelectChat, onNewChat, onToggleSidebar, onDeleteChat }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🧠 ZS Chat</h2>
        {/* You can use hamburger icon here */}
        <button className="toggle-btn" onClick={onToggleSidebar}>☰</button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>

      <div className="history-section">
        <h4>History</h4>
        {chats?.map((chat, index) => (
          <div key={index} className="history-item">
            <span onClick={() => onSelectChat(chat)}>Chat #{index + 1}</span>
            <button className="delete-btn" onClick={() => onDeleteChat(index)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;