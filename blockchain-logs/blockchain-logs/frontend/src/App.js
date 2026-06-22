import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SecurityLogsABI from './contracts/SecurityLogs.json';

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const generateHash = (user, actionType, details, timestamp) => {
    const data = user + actionType + details + timestamp.toString();
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }],
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const con = new ethers.Contract(CONTRACT_ADDRESS, SecurityLogsABI.abi, signer);
        setAccount(accounts[0]);
        setContract(con);
        setStatus("Connected: " + accounts[0]);
        await loadLogs(con);
      } catch (err) {
        setStatus("Error: " + err.message);
      }
    } else {
      setStatus("MetaMask not found!");
    }
  };

  const loadLogs = async (con) => {
    try {
      const allLogs = await con.getAllLogs();
      setLogs(allLogs);
    } catch (err) {
      console.error(err);
    }
  };

  const addLog = async (actionType, details) => {
    if (!contract) return;
    setLoading(true);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const logHash = generateHash(account, actionType, details, timestamp);
      const tx = await contract.addLog(actionType, details, logHash);
      await tx.wait();
      setStatus("Log recorded: " + actionType);
      await loadLogs(contract);
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Blockchain Security Logger</h1>
      {!account ? (
        <button onClick={connectWallet} style={btnStyle('#4CAF50')}>
          Connect MetaMask
        </button>
      ) : (
        <div>
          <p style={{ color: 'green' }}>{status}</p>
          <h2>Simulate Actions</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => addLog("LOGIN", "User login attempt")} style={btnStyle('#2196F3')} disabled={loading}>
              Simulate Login
            </button>
            <button onClick={() => addLog("ACCESS", "Accessed resource /admin")} style={btnStyle('#FF9800')} disabled={loading}>
              Access Resource
            </button>
            <button onClick={() => addLog("LOGOUT", "User logged out")} style={btnStyle('#9C27B0')} disabled={loading}>
              Simulate Logout
            </button>
            <button onClick={() => addLog("DOWNLOAD", "Downloaded sensitive file")} style={btnStyle('#F44336')} disabled={loading}>
              Download File
            </button>
          </div>
          {loading && <p>Processing transaction...</p>}
          <h2>Security Logs ({logs.length})</h2>
          {logs.length === 0 ? (
            <p>No logs yet. Simulate an action above!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#333', color: 'white' }}>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Details</th>
                  <th style={thStyle}>Hash</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Suspicious</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} style={{ background: log.isSuspicious ? '#ffebee' : '#f9f9f9' }}>
                    <td style={tdStyle}>{log.user.slice(0, 6)}...{log.user.slice(-4)}</td>
                    <td style={tdStyle}>{log.actionType}</td>
                    <td style={tdStyle}>{log.details}</td>
                    <td style={tdStyle}>{log.logHash ? log.logHash.slice(0, 10) + '...' : 'N/A'}</td>
                    <td style={tdStyle}>{new Date(Number(log.timestamp) * 1000).toLocaleString()}</td>
                    <td style={tdStyle}>{log.isSuspicious ? 'SUSPICIOUS' : 'OK'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {!account && <p style={{ color: 'gray' }}>{status}</p>}
    </div>
  );
}

const btnStyle = (color) => ({
  background: color, color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px'
});
const thStyle = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' };
const tdStyle = { padding: '8px', border: '1px solid #ddd', fontSize: '13px' };

export default App;