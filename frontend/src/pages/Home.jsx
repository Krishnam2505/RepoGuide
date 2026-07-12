import { useRepo } from '../context/RepoContext';
import RepoInput from '../components/RepoInput';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import ChatPanel from '../components/ChatPanel';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { currentRepo } = useRepo();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <AnimatePresence mode="wait">
        {!currentRepo ? (
          // BEFORE a repo is loaded, show the centered input omnibar
          <motion.div 
            key="input-view"
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <RepoInput />
          </motion.div>
        ) : (
          // AFTER a repo is loaded, fade in the massive 3-panel command center
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '1600px',
              display: 'flex',
              gap: '1rem'
            }}
          >
            {/* Left Panel: File Explorer */}
            <FileTree />
            
            {/* Center Panel: Syntax Highlighted Code Viewer */}
            <CodeViewer />
            
            {/* Right Panel: AI Chat Interface */}
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
