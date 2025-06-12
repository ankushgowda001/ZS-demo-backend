import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/QnAComponent.css';

const QnAComponent = ({ currentChat, onSaveChat, onToggleSidebar, sidebarOpen }) => {
  const [messages, setMessages] = useState(currentChat || []);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages(currentChat);
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { type: 'user', content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3002/ask', { question: query });
      const botMessage = { type: 'bot', content: res.data.answer };
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      onSaveChat(finalMessages);
    } catch {
      const botMessage = { type: 'bot', content: '❌ Something went wrong.' };
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      onSaveChat(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result.split(',')[1];
      try {
        const res = await axios.post('http://localhost:3002/upload', {
          fileName: file.name,
          fileType: file.type,
          fileContentBase64: base64Content,
        });

        const botMessage = {
          type: 'bot',
          content: `📁 File uploaded and ingested successfully! (${res.data.faissResult.chunks_added} chunks)`
        };
        setMessages((prev) => [...prev, botMessage]);
        onSaveChat([...messages, botMessage]);
      } catch (error) {
        const botMessage = { type: 'bot', content: '❌ File upload failed.' };
        setMessages((prev) => [...prev, botMessage]);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`chat-container ${sidebarOpen ? 'with-sidebar' : ''}`}>
      {!sidebarOpen && (
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>☰</button>
      )}

      <div className="chat-header">💬 ZS Chat Assistant</div>

      <div className="chat-box">
        {messages?.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.type}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <label className="upload-icon">
            📎
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default QnAComponent;