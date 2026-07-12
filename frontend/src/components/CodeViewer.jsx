import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for code
// Import common languages to ensure highlighting works
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

import { useRepo } from '../context/RepoContext';
import api from '../api/axios';
import { X, Code2 } from 'lucide-react';

export default function CodeViewer() {
  const { currentRepo, activeFile, setActiveFile } = useRepo();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!currentRepo || !activeFile) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/repo/${currentRepo}/file-content`, {
          params: { path: activeFile }
        });
        setContent(res.data.content);
      } catch (err) {
        setContent(`// Error loading file content.\n// ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [currentRepo, activeFile]);

  // Run Prism highlighting after content loads
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [content]);

  if (!activeFile) return null;

  // Determine language for Prism based on extension
  let lang = 'javascript';
  if (activeFile.endsWith('.py')) lang = 'python';
  if (activeFile.endsWith('.ts') || activeFile.endsWith('.tsx')) lang = 'typescript';
  if (activeFile.endsWith('.json')) lang = 'json';
  if (activeFile.endsWith('.md')) lang = 'markdown';
  if (activeFile.endsWith('.html')) lang = 'html';

  return (
    <motion.div 
      className="glass-panel"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '0 1rem'
      }}
    >
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={18} color="var(--accent-color)" />
          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' }}>
            {activeFile}
          </span>
        </div>
        <button 
          onClick={() => setActiveFile(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0', background: '#1d1f21' /* matches prism-tomorrow bg */ }}>
        {loading ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading file...</div>
        ) : (
          <pre style={{ margin: 0, padding: '1.5rem', minHeight: '100%', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <code ref={codeRef} className={`language-${lang}`}>
              {content}
            </code>
          </pre>
        )}
      </div>
    </motion.div>
  );
}
