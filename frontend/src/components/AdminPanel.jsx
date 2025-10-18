// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useBlockchain } from '../context/BlockchainProvider';

const backendUrl = import.meta.env.VITE_BACKEND_API_URL;

function AdminPanel() {
  const { isOwner, account } = useBlockchain();
  const [address, setAddress] = useState('');
  const [admins, setAdmins] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/admins`);
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      fetchAdmins();
    }
  }, [fetchAdmins, isOwner]);

  const handleAction = async (action) => {
    if (!isOwner) {
      setMessage('Only the contract owner can perform this action.');
      return;
    }
    if (!address) {
      setMessage('Please enter an address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${backendUrl}/${action}-admin`, {
        address,
      });
      setMessage(response.data.message);
      setTimeout(fetchAdmins, 2000);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.details || error.message}`);
    } finally {
      setLoading(false);
      setAddress('');
    }
  };

  if (!account) {
    return (
      <>
        <div className="panel-header">
          <span>👑</span>
          <h2>Admin Panel</h2>
        </div>
        <p>Please connect your wallet to view the admin panel.</p>
      </>
    );
  }

  if (!isOwner) {
    return (
      <>
        <div className="panel-header">
          <span>👑</span>
          <h2>Admin Panel</h2>
        </div>
        <p>You are not the contract owner. This panel is restricted.</p>
      </>
    );
  }

  return (
    <>
      <div className="panel-header">
        <span>👑</span>
        <h2>Manage Admins</h2>
      </div>
      <div className="admin-actions">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          disabled={loading}
        />
        <button
          onClick={() => handleAction('grant')}
          disabled={loading}
          className="btn-primary"
        >
          Grant
        </button>
        <button
          onClick={() => handleAction('revoke')}
          disabled={loading}
          className="btn-secondary"
        >
          Revoke
        </button>
      </div>

      {message && (
        <p
          className={
            message.startsWith('Error') ? 'error' : 'status-message'
          }
        >
          {message}
        </p>
      )}

      <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        Current Admins:
      </h4>
      <ul className="admin-list">
        {admins.length > 0 ? (
          admins.map((admin, index) => <li key={index}>{admin}</li>)
        ) : (
          <li>No admins found.</li>
        )}
      </ul>
    </>
  );
}

export default AdminPanel;