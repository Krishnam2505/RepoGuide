import { createContext, useContext, useState } from 'react';

const RepoContext = createContext(null);

export function RepoProvider({ children }) {
  // State for the currently loaded repository name (e.g. "Krishnam2505_RepoGuide")
  const [currentRepo, setCurrentRepo] = useState(null);
  
  // State for the file currently selected in the FileTree
  const [activeFile, setActiveFile] = useState(null);
  
  // State for the conversation history
  const [chatHistory, setChatHistory] = useState([]);

  // Loading state for when the ingest endpoint is running (can take 20s+)
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(""); // For showing specific messages like "Chunking files..."

  const value = {
    currentRepo,
    setCurrentRepo,
    activeFile,
    setActiveFile,
    chatHistory,
    setChatHistory,
    isIngesting,
    setIsIngesting,
    ingestStatus,
    setIngestStatus
  };

  return (
    <RepoContext.Provider value={value}>
      {children}
    </RepoContext.Provider>
  );
}

// Custom hook so components can easily grab state
export function useRepo() {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error("useRepo must be used within a RepoProvider");
  }
  return context;
}
