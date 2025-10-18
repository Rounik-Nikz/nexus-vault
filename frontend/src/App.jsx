// frontend/src/App.jsx
import React from 'react';
import { BlockchainProvider } from './context/BlockchainProvider';
import ConnectWallet from './components/ConnectWallet';
import UploadComponent from './components/UploadComponent';
import FileList from './components/FileList';
import AdminPanel from './components/AdminPanel';
import './App.css'; // Import the new CSS

function App() {
  return (
    <BlockchainProvider>
      <div className="app-container">
        <header>
          <h1>IPFS File Registry DApp</h1>
          <ConnectWallet />
        </header>
        <main>
          <div className="panels">
            <div className="panel">
              <UploadComponent />
            </div>
            <div className="panel">
              <AdminPanel />
            </div>
          </div>
          <div className="file-list-container panel">
            <FileList />
          </div>
        </main>
      </div>
    </BlockchainProvider>
  );
}

export default App;