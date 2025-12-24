'use client';

import { useState } from 'react';
import { useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react';
import { mainnetNetworks, testnetNetworks, networkMeta } from '@/config';
import styles from './NetworkSelector.module.css';

type NetworkMode = 'mainnet' | 'testnet';

export default function NetworkSelector() {
    const [mode, setMode] = useState<NetworkMode>('mainnet');
    const { chainId, switchNetwork } = useAppKitNetwork();
    const { isConnected } = useAppKitAccount();

    const networks = mode === 'mainnet' ? mainnetNetworks : testnetNetworks;

    const handleNetworkSwitch = async (network: typeof networks[0]) => {
        if (!isConnected) return;
        try {
            switchNetwork(network);
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Select Network</h3>
                <div className="toggle-group">
                    <button
                        type="button"
                        className={`toggle-btn ${mode === 'mainnet' ? 'active' : ''}`}
                        onClick={() => setMode('mainnet')}
                    >
                        Mainnet
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${mode === 'testnet' ? 'active' : ''}`}
                        onClick={() => setMode('testnet')}
                    >
                        Testnet
                    </button>
                </div>
            </div>

            <div className={styles.networkGrid}>
                {networks.map((network) => {
                    // Handle both number and string IDs safely
                    const meta = networkMeta[String(network.id)];
                    const isActive = String(chainId) === String(network.id);

                    return (
                        <button
                            key={network.id}
                            type="button"
                            className={`${styles.networkBtn} ${isActive ? styles.active : ''}`}
                            onClick={() => handleNetworkSwitch(network)}
                            disabled={!isConnected}
                        >
                            <span className={styles.networkName}>{meta?.name || network.name}</span>
                            {isActive && <span className={styles.activeBadge}>Connected</span>}
                        </button>
                    );
                })}
            </div>

            {!isConnected && (
                <p className={styles.hint}>Connect your wallet to switch networks</p>
            )}
        </div>
    );
}
