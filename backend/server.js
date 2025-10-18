// backend/server.js

require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const initializeDb = require('./db/init'); // <-- Import the initializer function
const FileRegistryABI = require('../blockchain/build/contracts/FileRegistry.json').abi;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Ethers & Contract Setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, FileRegistryABI, provider);
const contractWithSigner = contract.connect(wallet);

// Main function to start the application
async function main() {
    // Wait for the database to be initialized before doing anything else
    const db = await initializeDb();

    // --- Event Listeners ---
    function setupEventListeners() {
        console.log("Setting up blockchain event listeners...");

        contract.on("FileStored", (cid, filename, uploader, timestamp) => {
            console.log(`[EVENT] FileStored: CID=${cid}, Uploader=${uploader}`);
            const stmt = db.prepare("INSERT OR IGNORE INTO files (cid, filename, uploader_address, timestamp) VALUES (?, ?, ?, ?)");
            stmt.run(cid, filename, uploader, Number(timestamp));
            stmt.finalize();
        });

        contract.on("AdminGranted", (adminAddress) => {
            console.log(`[EVENT] AdminGranted: Address=${adminAddress}`);
            const stmt = db.prepare("INSERT OR IGNORE INTO admins (address) VALUES (?)");
            stmt.run(adminAddress);
            stmt.finalize();
        });

        contract.on("AdminRevoked", (adminAddress) => {
            console.log(`[EVENT] AdminRevoked: Address=${adminAddress}`);
            const stmt = db.prepare("DELETE FROM admins WHERE address = ?");
            stmt.run(adminAddress);
            stmt.finalize();
        });

        // Add owner as admin on initial startup, as events might have been missed
        (async () => {
            const ownerAddress = await wallet.getAddress();
            const stmt = db.prepare("INSERT OR IGNORE INTO admins (address) VALUES (?)");
            stmt.run(ownerAddress);
            stmt.finalize();
            console.log(`Ensured owner (${ownerAddress}) is registered as admin.`);
        })();
        
        console.log("✅ Event listeners are active.");
    }

    // --- API Routes ---

    app.get('/files', (req, res) => {
        // ... (rest of the file remains the same)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countQuery = "SELECT COUNT(*) as count FROM files";
        const dataQuery = "SELECT * FROM files ORDER BY timestamp DESC LIMIT ? OFFSET ?";

        db.get(countQuery, [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalItems = row.count;
            const totalPages = Math.ceil(totalItems / limit);

            db.all(dataQuery, [limit, offset], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    data: rows,
                    pagination: {
                        page,
                        limit,
                        totalItems,
                        totalPages
                    }
                });
            });
        });
    });

    app.get('/admins', (req, res) => {
        db.all("SELECT address FROM admins", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(r => r.address));
        });
    });

    app.post('/grant-admin', async (req, res) => {
        const { address } = req.body;
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: "Invalid Ethereum address" });
        }
        try {
            const tx = await contractWithSigner.grantAdmin(address);
            await tx.wait();
            res.json({ success: true, message: `Admin role granted to ${address}`, txHash: tx.hash });
        } catch (error) {
            res.status(500).json({ error: "Failed to grant admin role", details: error.message });
        }
    });

    app.post('/revoke-admin', async (req, res) => {
        const { address } = req.body;
         if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: "Invalid Ethereum address" });
        }
        try {
            const tx = await contractWithSigner.revokeAdmin(address);
            await tx.wait();
            res.json({ success: true, message: `Admin role revoked from ${address}`, txHash: tx.hash });
        } catch (error) {
            res.status(500).json({ error: "Failed to revoke admin role", details: error.message });
        }
    });

    // --- Server Start ---
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
        setupEventListeners();
    });
}

// Start the application and catch any errors during initialization
main().catch(error => {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
});