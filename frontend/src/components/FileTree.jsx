import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { File, FolderTree, Code, FileText, Image as ImageIcon, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import api from '../api/axios';
import { useRepo } from '../context/RepoContext';

// Helper to pick a nice icon based on file extension
const getFileIcon = (filename) => {
  if (!filename) return <File size={16} />;
  if (filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.py') || filename.endsWith('.ts') || filename.endsWith('.tsx')) return <Code size={16} />;
  if (filename.endsWith('.md') || filename.endsWith('.txt')) return <FileText size={16} />;
  if (filename.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return <ImageIcon size={16} />;
  return <File size={16} />;
};

// Helper to build a tree from flat paths
const buildTree = (paths) => {
  const root = { name: 'root', children: {}, isFile: false, path: '' };
  
  (paths || []).forEach(path => {
    if (!path) return;
    const parts = path.split('/');
    let current = root;
    let currentPath = '';
    
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          children: {},
          isFile: index === parts.length - 1,
          path: currentPath
        };
      }
      current = current.children[part];
    });
  });
  
  return root;
};

const TreeNode = ({ node, level = 0, activeFile, setActiveFile }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open root level
  
  if (!node) return null;

  if (node.isFile) {
    const isActive = activeFile === node.path;
    return (
      <div 
        onClick={() => setActiveFile(node.path)}
        style={{
          paddingLeft: `${level * 16 + 12}px`,
          paddingTop: '6px',
          paddingBottom: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: isActive ? 'white' : 'var(--text-muted)',
          background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          borderLeft: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
          transition: 'all 0.2s ease',
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
        <span style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--accent-color)' : 'inherit', display: 'flex' }}>
          {getFileIcon(node.name)}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
      </div>
    );
  }

  // Folder
  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          paddingLeft: `${level * 16}px`,
          paddingTop: '6px',
          paddingBottom: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          borderLeft: '3px solid transparent',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ display: 'flex', color: 'var(--accent-color)', opacity: 0.8 }}>
          {isOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
      </div>
      {isOpen && node.children && (
        <div>
          {Object.values(node.children).sort((a, b) => {
            // Folders first, then files
            const aName = a?.name || '';
            const bName = b?.name || '';
            if (a.isFile === b.isFile) return aName.localeCompare(bName);
            return a.isFile ? 1 : -1;
          }).map(child => (
            <TreeNode key={child.path || child.name} node={child} level={level + 1} activeFile={activeFile} setActiveFile={setActiveFile} />
          ))}
        </div>
      )}
    </div>
  );
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
        setFiles(response.data?.files || []);
      } catch (err) {
        console.error("Failed to load file tree", err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [currentRepo]);

  const treeData = useMemo(() => buildTree(files || []), [files]);

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
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading files...</div>
        ) : (
          <div>
            {Object.values(treeData.children || {}).sort((a, b) => {
              const aName = a?.name || '';
              const bName = b?.name || '';
              if (a.isFile === b.isFile) return aName.localeCompare(bName);
              return a.isFile ? 1 : -1;
            }).map(child => (
              <TreeNode key={child.path || child.name} node={child} level={0} activeFile={activeFile} setActiveFile={setActiveFile} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
