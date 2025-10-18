// frontend/src/components/ConnectWallet.jsx
import React from 'react';
import { useBlockchain } from '../context/BlockchainProvider';

function ConnectWallet() {
  const { account, connect } = useBlockchain();

  const formatAddress = (addr) => {
    return addr
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : '';
  };

  return (
    <div className="wallet-connector">
      {account ? (
        <p className="address-display">
          Connected: <strong>{formatAddress(account)}</strong>
        </p>
      ) : (
        <button onClick={connect} className="btn-primary">
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;