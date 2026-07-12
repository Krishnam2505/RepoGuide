import { RepoProvider } from './context/RepoContext';
import Home from './pages/Home';

function App() {
  return (
    // We wrap our entire app in the RepoProvider so every component
    // has access to the currentRepo, activeFile, and chatHistory states.
    <RepoProvider>
      <Home />
    </RepoProvider>
  );
}

export default App;
