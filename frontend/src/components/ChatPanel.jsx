import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, FileCode2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useRepo } from '../context/RepoContext';
import ReactMarkdown from 'react-markdown';

// Component for individual message bubbles
function MessageBubble({ msg }) {
  const { setActiveFile } = useRepo();
  const isAI = msg.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '1.5rem',
        flexDirection: isAI ? 'row' : 'row-reverse'
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isAI ? 'rgba(99, 102, 241, 0.2)' : 'linear-gradient(135deg, var(--accent-color), #818cf8)',
        color: isAI ? 'var(--accent-color)' : 'white',
        flexShrink: 0
      }}>
        {isAI ? <Bot size={20} /> : <User size={20} />}
      </div>
      
      <div style={{
        maxWidth: '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAI ? 'flex-start' : 'flex-end'
      }}>
        <div style={{
          padding: '12px 18px',
          borderRadius: '16px',
          borderTopLeftRadius: isAI ? '4px' : '16px',
          borderTopRightRadius: isAI ? '16px' : '4px',
          background: isAI ? 'rgba(30, 30, 45, 0.7)' : 'var(--accent-color)',
          color: 'white',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: isAI ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}>
          {/* We use ReactMarkdown to beautifully render bold text, lists, and inline code */}
          <ReactMarkdown 
            components={{
              code({node, inline, className, children, ...props}) {
                return (
                  <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
        
        {/* Source Citations */}
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {msg.sources.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveFile(src)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <FileCode2 size={12} />
                {src}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPanel() {
  const { currentRepo, chatHistory, setChatHistory } = useRepo();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput('');
    
    // Optimistically add user message to UI
    const updatedHistory = [...chatHistory, { role: 'user', content: userQuestion }];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      const res = await api.post('/api/chat', {
        repo_name: currentRepo,
        question: userQuestion
      });
      
      setChatHistory([
        ...updatedHistory,
        { role: 'ai', content: res.data.answer, sources: res.data.sources }
      ]);
    } catch (err) {
      setChatHistory([
        ...updatedHistory,
        { role: 'ai', content: `**Error:** ${err.response?.data?.detail || "Failed to reach AI."}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!currentRepo) return null;

  return (
    <motion.div 
      className="glass-panel"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{
        width: '400px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Bot size={20} color="var(--accent-color)" />
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>AI Assistant</h3>
      </div>
      
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', scrollBehavior: 'smooth' }}>
        {chatHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.9rem' }}>
            <Bot size={40} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
            <p>Ask a question about the repository!</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>Example: "Where is the authentication middleware?"</p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))
        )}
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '15px' }}
          >
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)' }}>
              <Bot size={20} />
            </div>
            <div style={{ padding: '12px 18px', borderRadius: '16px', background: 'rgba(30, 30, 45, 0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>
      
      <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '100px', padding: '6px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              outline: 'none',
              padding: '8px 12px',
              fontSize: '0.95rem'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{
              background: (!input.trim() || loading) ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)',
              color: (!input.trim() || loading) ? 'rgba(255,255,255,0.4)' : 'white',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
