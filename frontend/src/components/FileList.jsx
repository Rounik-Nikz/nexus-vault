// frontend/src/components/FileList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY_URL;

function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/files`);
      setFiles(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch files from the backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 15000);
    return () => clearInterval(interval);
  }, [fetchFiles]);

  return (
    <div className="file-list-component">
      <div className="panel-header">
        <span>🗂️</span>
        <h2>Stored Files</h2>
      </div>

      {loading && <p>Loading files...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>IPFS CID</th>
                <th>Uploader</th>
                <th>Timestamp</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file) => (
                  <tr key={file.cid}>
                    <td>{file.filename}</td>
                    <td title={file.cid}>{`${file.cid.substring(
                      0,
                      10
                    )}...`}</td>
                    <td
                      title={file.uploader_address}
                    >{`${file.uploader_address.substring(
                      0,
                      6
                    )}...${file.uploader_address.substring(
                      file.uploader_address.length - 4
                    )}`}</td>
                    <td>
                      {new Date(file.timestamp * 1000).toLocaleString()}
                    </td>
                    <td>
                      <a
                        href={`${ipfsGateway}${file.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-files-row">
                  <td colSpan="5">No files stored yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FileList;