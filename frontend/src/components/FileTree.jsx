import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { File, FolderTree, Code, FileText, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import { useRepo } from '../context/RepoContext';

// Helper to pick a nice icon based on file extension
const getFileIcon = (filename) => {
  if (filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.py')) return <Code size={16} />;
  if (filename.endsWith('.md') || filename.endsWith('.txt')) return <FileText size={16} />;
  if (filename.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return <ImageIcon size={16} />;
  return <File size={16} />;
};

export default function FileTree() {
  const { currentRepo, activeFile, setActiveFile } = useRepo();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;
    
    const loadFiles = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/repo/${currentRepo}/files`);
        setFiles(response.data.files);
      } catch (err) {
        console.error("Failed to load file tree", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [currentRepo]);

  if (!currentRepo) return null;

  return (
    <motion.div 
      className="glass-panel"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        width: '300px',
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
        <FolderTree size={20} color="var(--accent-color)" />
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Repository Files</h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading files...</div>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {files.map((file) => {
              const isActive = activeFile === file;
              return (
                <li key={file}>
                  <button
                    onClick={() => setActiveFile(file)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease',
                      borderLeft: isActive ? '3px solid var(--accent-color)' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--accent-color)' : 'inherit' }}>
                      {getFileIcon(file)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
