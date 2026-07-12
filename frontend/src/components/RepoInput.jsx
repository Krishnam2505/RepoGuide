import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useRepo } from '../context/RepoContext';

export default function RepoInput() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const { setCurrentRepo, isIngesting, setIsIngesting, ingestStatus, setIngestStatus } = useRepo();

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!url.includes('github.com')) {
      setError("Please enter a valid GitHub URL.");
      return;
    }
    
    setError(null);
    setIsIngesting(true);
    setIngestStatus("Cloning repository and analyzing files...");
    
    try {
      // Send the IngestRequest matching our backend Pydantic schema
      const response = await api.post('/api/repo/ingest', { repo_url: url });
      
      // On success, save the repo_name in global state so other components know about it
      setCurrentRepo(response.data.repo_name);
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while loading the repository.");
    } finally {
      setIsIngesting(false);
      setIngestStatus("");
    }
  };

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
        Repo<span style={{ color: 'var(--accent-color)' }}>Guide</span>
      </h1>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px', textAlign: 'center', lineHeight: '1.5' }}>
        Paste any public GitHub repository to instantly search, browse, and chat with the codebase using AI.
      </p>
      
      <form 
        onSubmit={handleIngest} 
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem',
          borderRadius: '100px', // Pill shape omnibar
          width: '100%',
          maxWidth: '600px',
          transition: 'all 0.3s ease',
          boxShadow: isIngesting ? '0 0 20px rgba(99, 102, 241, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ padding: '0 15px', color: 'var(--text-muted)' }}>
          <Search size={20} />
        </div>
        
        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a GitHub URL (e.g. https://github.com/facebook/react)"
          disabled={isIngesting}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
            padding: '10px 0'
          }}
        />
        
        <button 
          type="submit" 
          disabled={isIngesting || !url}
          className="btn-primary"
          style={{
            borderRadius: '100px',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: (!url || isIngesting) ? 0.6 : 1
          }}
        >
          {isIngesting ? (
            <>
              <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> 
              <span>Ingesting</span>
            </>
          ) : (
            <span>Load</span>
          )}
        </button>
      </form>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .example-tag {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .example-tag:hover {
          color: var(--text-main);
          border-color: var(--accent-color);
          background: rgba(47, 129, 247, 0.1);
        }
      `}</style>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: 'var(--error-color)', marginTop: '1.5rem', fontSize: '0.9rem' }}
        >
          {error}
        </motion.div>
      )}
      
      {isIngesting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--accent-color)', marginTop: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}
        >
          {ingestStatus}
        </motion.div>
      )}

      {!isIngesting && !error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Try an example
          </span>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="example-tag" onClick={() => setUrl('https://github.com/facebook/react')}>facebook/react</button>
            <button className="example-tag" onClick={() => setUrl('https://github.com/vuejs/core')}>vuejs/core</button>
            <button className="example-tag" onClick={() => setUrl('https://github.com/fastapi/fastapi')}>fastapi/fastapi</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
