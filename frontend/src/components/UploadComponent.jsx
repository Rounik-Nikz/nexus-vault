// frontend/src/components/UploadComponent.jsx
import React, { useState } from 'react';
import { create } from 'ipfs-http-client';
import { useBlockchain } from '../context/BlockchainProvider';

const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

function UploadComponent() {
  const { contract, account, isAdmin } = useBlockchain();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file || !contract) {
      setMessage('Please select a file and connect your wallet.');
      return;
    }
    if (!isAdmin) {
      setMessage('Only admins can upload files.');
      return;
    }

    setUploading(true);
    setMessage('1/4: Uploading to IPFS...');

    try {
      // 1. Upload to IPFS
      const added = await ipfs.add(file);
      const cid = added.path;
      setMessage(`2/4: IPFS upload successful! CID: ${cid}.`);

      // 2. Copy to MFS
      setMessage('3/4: Copying to MFS...');
      const mfsPath = `/${file.name}`;
      try {
        await ipfs.files.stat(mfsPath);
        await ipfs.files.rm(mfsPath);
      } catch (error) {
        // File doesn't exist, fine to proceed
      }
      await ipfs.files.cp(`/ipfs/${cid}`, mfsPath);

      // 3. Store on blockchain
      setMessage('4/4: Signing blockchain transaction...');
      const tx = await contract.storeFile(cid, file.name);
      await tx.wait();

      setMessage(`✅ File stored successfully! Transaction Hash: ${tx.hash}`);
      setFile(null);
      document.getElementById('file-upload').value = null; // Reset file input
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage(`Error: ${error.reason || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!account) {
    return (
      <>
        <div className="panel-header">
          <span>📁</span>
          <h2>Upload New File</h2>
        </div>
        <p>Please connect your wallet to upload files.</p>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <div className="panel-header">
          <span>📁</span>
          <h2>Upload New File</h2>
        </div>
        <p className="error">
          Your address is not registered as an admin. Only admins can upload
          files.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="panel-header">
        <span>📁</span>
        <h2>Upload New File</h2>
      </div>
      <div className="upload-form">
        <label htmlFor="file-upload" className="custom-file-upload">
          {file ? <span>{file.name}</span> : 'Click to choose a file'}
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="btn-primary"
        >
          {uploading ? 'Processing...' : 'Upload & Store'}
        </button>
      </div>

      {message && (
        <p
          className={
            message.startsWith('Error') || message.startsWith('Only admins')
              ? 'error'
              : 'status-message'
          }
        >
          {message}
        </p>
      )}
    </>
  );
}

export default UploadComponent;