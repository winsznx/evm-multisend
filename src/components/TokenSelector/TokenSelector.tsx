'use client';

import { useState, useEffect } from 'react';
import { useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react';
import { useBalance, useReadContracts } from 'wagmi';
import { formatUnits, isAddress } from 'viem';
import { networkMeta } from '@/config';
import { ERC20_ABI, type Token } from '@/types';
import { formatNumber } from '@/utils';
import styles from './TokenSelector.module.css';

interface TokenSelectorProps {
    selectedToken: Token | null;
    onSelectToken: (token: Token) => void;
}

export default function TokenSelector({
    selectedToken,
    onSelectToken,
}: TokenSelectorProps) {
    const [customTokenAddress, setCustomTokenAddress] = useState('');
    const [isLoadingToken, setIsLoadingToken] = useState(false);
    const [tokenError, setTokenError] = useState('');

    const { chainId } = useAppKitNetwork();
    const { address, isConnected } = useAppKitAccount();

    // Get native token balance
    const { data: nativeBalance } = useBalance({
        address: address as `0x${string}` | undefined,
    });

    // Get network info
    const networkInfo = chainId ? networkMeta[String(chainId)] : null;
    const nativeSymbol = networkInfo?.symbol || 'ETH';

    // Native token object
    const nativeToken: Token = {
        address: '0x0000000000000000000000000000000000000000',
        symbol: nativeSymbol,
        name: `${networkInfo?.name || 'Native'} ${nativeSymbol}`,
        decimals: 18,
        balance: nativeBalance ? formatUnits(nativeBalance.value, nativeBalance.decimals) : '0',
        isNative: true,
    };

    // Read custom token data
    const validCustomAddress = isAddress(customTokenAddress) ? customTokenAddress as `0x${string}` : undefined;

    const { data: tokenData } = useReadContracts({
        contracts: validCustomAddress ? [
            {
                address: validCustomAddress,
                abi: ERC20_ABI,
                functionName: 'name',
            },
            {
                address: validCustomAddress,
                abi: ERC20_ABI,
                functionName: 'symbol',
            },
            {
                address: validCustomAddress,
                abi: ERC20_ABI,
                functionName: 'decimals',
            },
            {
                address: validCustomAddress,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            },
        ] : [],
        query: {
            enabled: !!validCustomAddress && !!address,
        },
    });

    // Set native token as default
    useEffect(() => {
        if (!selectedToken && isConnected) {
            onSelectToken(nativeToken);
        }
    }, [isConnected, chainId]);

    // Handle custom token addition
    const handleAddCustomToken = async () => {
        if (!validCustomAddress) {
            setTokenError('Please enter a valid token address');
            return;
        }

        setIsLoadingToken(true);
        setTokenError('');

        try {
            if (
                tokenData &&
                tokenData[0]?.status === 'success' &&
                tokenData[1]?.status === 'success' &&
                tokenData[2]?.status === 'success'
            ) {
                const decimals = tokenData[2].result as number;
                const balance =
                    tokenData[3]?.status === 'success' && tokenData[3].result
                        ? formatUnits(tokenData[3].result as bigint, decimals)
                        : '0';

                const customToken: Token = {
                    address: customTokenAddress,
                    name: tokenData[0].result as string,
                    symbol: tokenData[1].result as string,
                    decimals: decimals,
                    balance: balance,
                    isNative: false,
                };
                onSelectToken(customToken);
                setCustomTokenAddress('');
            } else {
                setTokenError('Invalid token contract');
            }
        } catch {
            setTokenError('Failed to load token');
        } finally {
            setIsLoadingToken(false);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Select Token</h3>

            {/* Native Token Button */}
            <button
                type="button"
                className={`${styles.tokenBtn} ${selectedToken?.isNative ? styles.active : ''
                    }`}
                onClick={() => onSelectToken(nativeToken)}
            >
                <div className={styles.tokenInfo}>
                    <span className={styles.tokenSymbol}>{nativeSymbol}</span>
                    <span className={styles.tokenName}>Native Token</span>
                </div>
                {isConnected && nativeBalance && (
                    <span className={styles.tokenBalance}>
                        {formatNumber(nativeToken.balance || '0')} {nativeSymbol}
                    </span>
                )}
            </button>

            {/* Custom Token Selection */}
            {selectedToken && !selectedToken.isNative && (
                <button
                    type="button"
                    className={`${styles.tokenBtn} ${styles.active}`}
                    onClick={() => { }}
                >
                    <div className={styles.tokenInfo}>
                        <span className={styles.tokenSymbol}>{selectedToken.symbol}</span>
                        <span className={styles.tokenName}>{selectedToken.name}</span>
                    </div>
                    <span className={styles.tokenBalance}>
                        {formatNumber(selectedToken.balance || '0')} {selectedToken.symbol}
                    </span>
                </button>
            )}

            {/* Custom Token Input */}
            <div className={styles.customToken}>
                <label className="label">Add Custom Token</label>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter token contract address (0x...)"
                        value={customTokenAddress}
                        onChange={(e) => {
                            setCustomTokenAddress(e.target.value);
                            setTokenError('');
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddCustomToken}
                        disabled={!customTokenAddress || isLoadingToken}
                    >
                        {isLoadingToken ? (
                            <span className="spinner" />
                        ) : (
                            'Add'
                        )}
                    </button>
                </div>
                {tokenError && <p className={styles.error}>{tokenError}</p>}
            </div>
        </div>
    );
}
