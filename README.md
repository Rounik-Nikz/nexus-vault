# 📦 Full-Stack IPFS & Blockchain File Registry

This is a complete full-stack project that allows users to upload files to IPFS and store the file's metadata (CID, filename, uploader, timestamp) on a local Ethereum blockchain (Ganache).

It features a React frontend for user interaction, a Solidity smart contract for on-chain logic, and a Node.js backend service that listens for blockchain events to build an indexed database of all stored files.

## 🚀 How it Works (The Data Flow)

1. **Connect:** A user visits the React frontend and connects their MetaMask wallet.
2. **Upload to IPFS:** The user selects a file. The frontend uploads this file directly to the local **IPFS Desktop** node, which pins the file and returns a **CID (Content Identifier)**.
3. **Update MFS:** The frontend also copies the file to the IPFS **Mutable File System (MFS)**, which allows the file to be seen in the "Files" tab of the IPFS Desktop app.
4. **Blockchain Transaction:** The user (who must be an admin) is prompted to sign a MetaMask transaction. This calls the `storeFile()` function on the `FileRegistry.sol` smart contract, saving the CID and filename on the blockchain.
5. **Event Emission:** The smart contract emits a `FileStored` event with all the file's metadata.
6. **Backend Listener:** The Node.js backend, which is constantly listening to the smart contract, catches this `FileStored` event.
7. **Database Indexing:** The backend parses the event data and saves it to a local **SQLite** database.
8. **Display Files:** The React frontend's "Stored Files" list polls the backend's `/files` API, which reads from the SQLite database to display an up-to-date list of all files.

## 🛠️ Tech Stack

* **Frontend:**
  * React (with Vite)
  * `ethers.js` (Wallet interaction & transactions)
  * `ipfs-http-client` (Programmatic IPFS uploads)
  * `axios` (API communication with backend)
* **Backend:**
  * Node.js / Express (REST API)
  * `ethers.js` (Listening to blockchain events)
  * `sqlite3` (Database for indexing events)
* **Blockchain:**
  * Solidity (Smart Contract)
  * Truffle (Development & deployment)
  * Ganache (Local Ethereum node)
* **File Storage:**
  * IPFS Desktop (Local IPFS node)

## 📋 Prerequisites

Before you begin, you must have the following software installed:

* [Node.js](https://nodejs.org/en/) (v18 or later)
* [Ganache](https://trufflesuite.com/ganache/) (Local blockchain)
* [IPFS Desktop](https://ipfs.io/desktop/) (Local IPFS node)
* [Truffle](https://trufflesuite.com/truffle/) (Globally: `npm install -g truffle`)
* [MetaMask](https://metamask.io/) (Browser extension)

---

## ⚙️ Setup & Installation

Follow these steps precisely to get the project running.

### 1. Clone & Install

First, clone the repository and install all dependencies from the root folder.

```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd ipfs-file-registry
npm run install:all
```

### 2\. Start Services

Launch your local **Ganache** and **IPFS Desktop** applications.

* Keep Ganache running on its default `http://127.0.0.1:7545`.
* Make sure your IPFS node is "Running" and the API is on `http://127.0.0.1:5001`.

### 3\. Configure IPFS (Critical)

Your IPFS node needs to accept requests from your frontend (a.k.a. CORS).

1. In **IPFS Desktop**, go to the **Settings** tab.
2. Click the **"Edit"** button to open the `config.json` file.
3. Find the `"API"` section and, within it, the `"HTTPHeaders"` object.
4. Modify it to allow requests from your frontend's origin (`http://localhost:5173`).

   **Replace this:**

   ```json
   "HTTPHeaders": {
     "Access-Control-Allow-Origin": [
       "[https://webui.ipfs.io](https://webui.ipfs.io)",
       "[http://webui.ipfs.io.ipns.localhost:8080](http://webui.ipfs.io.ipns.localhost:8080)"
     ]
   }
   ```

   **With this:**

   ```json
   "HTTPHeaders": {
     "Access-Control-Allow-Origin": [
       "[https://webui.ipfs.io](https://webui.ipfs.io)",
       "[http://webui.ipfs.io.ipns.localhost:8080](http://webui.ipfs.io.ipns.localhost:8080)",
       "http://localhost:5173"
     ],
     "Access-Control-Allow-Methods": [
       "PUT",
       "POST",
       "GET"
     ]
   }
   ```
5. **Save** the file.
6. Go back to the **Status** tab in IPFS Desktop and **Restart** your node.

### 4\. Deploy Smart Contract

With Ganache running, deploy your contract.

```bash
# Navigate to the blockchain directory
cd blockchain

# Compile and deploy
truffle migrate --reset

# After it succeeds, copy the deployed `FileRegistry` contract address.
# It will look like this:
# > contract address:    0xAbC...123
```

### 5\. Configure Environment (.env)

You must set up the environment files for both the frontend and backend.

**A. Backend (`backend/.env`)**
Create a file named `.env` in the `backend/` folder and add the following. Take reference from `.env.example`

```env
# URL from your Ganache instance
RPC_URL="http://127.0.0.1:7545"

# The address you just copied from truffle migrate
CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"

# The private key of the FIRST account in Ganache (the owner)
# In Ganache, click the "key" icon 🔑 next to the first account
OWNER_PRIVATE_KEY="YOUR_GANACHE_OWNER_ACCOUNT_PRIVATE_KEY"

# IPFS API
IPFS_API_URL="http://127.0.0.1:5001"

# Server port
PORT=3001
```

**B. Frontend (`frontend/.env`)**
Create a file named `.env` in the `frontend/` folder and add the following. Take reference from `.env.example`

```env
# The address you just copied from truffle migrate
VITE_CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"

# The backend API URL
VITE_BACKEND_API_URL="http://localhost:3001"

# Your IPFS gateway (for download links)
VITE_IPFS_GATEWAY_URL="http://127.0.0.1:8080/ipfs/"
```

### 6\. Configure MetaMask

1. Open MetaMask and click the network dropdown.
2. Select "Add network" \> "Add a network manually".
3. Enter the Ganache details:
   * **Network Name:** `Ganache Local`
   * **New RPC URL:** `http://127.0.0.1:7545`
   * **Chain ID:** `1337`
   * **Currency Symbol:** `ETH`
4. Click **Save**.
5. In MetaMask, import your ganache account:
   * Click the circle icon \> "Import account".
   * Paste the **Private Key** from `backend/.env` (the same one from Ganache).

### 7\. Run the Project\!

Navigate back to the project's root directory and use the `npm run dev` command to start both servers concurrently.

```bash
# Go back to the root
cd ..

# Start the frontend (Vite) and backend (Node) at the same time
npm run dev
```

Your application will be running at `http://localhost:5173`.

---

## 📁 Project Structure

```text
/ipfs-file-registry
|
|-- backend/         # Node.js event listener & REST API server
|   |-- db/
|   |   |-- init.js
|   |   `-- database.sqlite  (This will be created)
|   |-- server.js
|   `-- .env
|
|-- blockchain/      # Solidity smart contract
|   |-- contracts/
|   |   `-- FileRegistry.sol
|   |-- migrations/
|   |-- build/
|   `-- truffle-config.js
|
|-- frontend/        # Vite + React user interface
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   `-- .env
|
`-- package.json     # Root package to run both servers
```

