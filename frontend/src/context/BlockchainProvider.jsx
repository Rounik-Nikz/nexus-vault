// frontend/src/context/BlockchainProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import FileRegistryABI from '../../../blockchain/build/contracts/FileRegistry.json';

const BlockchainContext = createContext();

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    const connect = async () => {
        if (window.ethereum) {
            try {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await newProvider.send("eth_requestAccounts", []);
                const newSigner = await newProvider.getSigner();
                const newContract = new ethers.Contract(contractAddress, FileRegistryABI.abi, newSigner);
                
                setProvider(newProvider);
                setSigner(newSigner);
                setContract(newContract);
                setAccount(accounts[0]);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    useEffect(() => {
        const checkRoles = async () => {
            if (contract && account) {
                try {
                    const adminStatus = await contract.admins(account);
                    const ownerAddress = await contract.owner();
                    setIsAdmin(adminStatus);
                    setIsOwner(account.toLowerCase() === ownerAddress.toLowerCase());
                } catch (error) {
                    console.error("Error checking roles:", error);
                }
            }
        };
        checkRoles();
    }, [contract, account]);
    
     // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                   connect(); // Re-connect with the new account
                } else {
                    // Handle user disconnection
                    setAccount(null);
                    setSigner(null);
                    setIsAdmin(false);
                    setIsOwner(false);
                }
            });
        }
    }, []);


    const value = {
        connect,
        provider,
        signer,
        contract,
        account,
        isAdmin,
        isOwner,
    };

    return (
        <BlockchainContext.Provider value={value}>
            {children}
        </BlockchainContext.Provider>
    );
};