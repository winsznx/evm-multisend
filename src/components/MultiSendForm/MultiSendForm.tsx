'use client';

import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useSendTransaction, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import {
    NetworkSelector,
    TokenSelector,
    RecipientList,
    BulkImportModal,
    TransactionSummary,
} from '@/components';
import { ERC20_ABI } from '@/types';
import type { Recipient, Token, TransactionStatus } from '@/types';
import { createRecipient, validateRecipient, findDuplicateAddresses } from '@/utils';
import { MULTISEND_ADDRESSES, MULTISEND_ABI } from '@/config/contracts';
import styles from './MultiSendForm.module.css';

export default function MultiSendForm() {
    const [recipients, setRecipients] = useState<Recipient[]>([createRecipient()]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });

    const { isConnected, address } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();
    const publicClient = usePublicClient();

    // Transaction hooks
    const { writeContractAsync } = useWriteContract();

    // Recipient management
    const handleAddRecipient = useCallback(() => {
        setRecipients((prev) => [...prev, createRecipient()]);
    }, []);

    const handleRemoveRecipient = useCallback((id: string) => {
        setRecipients((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const handleUpdateRecipient = useCallback(
        (id: string, field: 'address' | 'amount', value: string) => {
            setRecipients((prev) =>
                prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
            );
        },
        []
    );

    const handleBulkImport = useCallback((importedRecipients: Recipient[]) => {
        setRecipients(importedRecipients);
    }, []);

    const handleClearAll = useCallback(() => {
        setRecipients([createRecipient()]);
        setTxStatus({ status: 'idle' });
    }, []);

    // Send transaction
    const handleSend = async () => {
        if (!isConnected || !address || !selectedToken) {
            return;
        }

        // Check for Bitcoin network
        if (String(chainId).includes('bitcoin') || String(chainId).startsWith('bip122')) {
            setTxStatus({
                status: 'error',
                error: 'Bitcoin sending is architected but not implemented in this UI demo.',
            });
            return;
        }

        // Check if contract exists for this chain
        const contractAddress = MULTISEND_ADDRESSES[Number(chainId)];
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            // Fallback for demo on non-deployed chains: Just show error
            // Or allow native simple send if you want (previous behavior)
            // But goal is to verify contract.
            setTxStatus({
                status: 'error',
                error: 'MultiSend contract not deployed or configured for this network.',
            });
            return;
        }

        const validRecipients = recipients.filter(validateRecipient);
        if (validRecipients.length === 0) {
            setTxStatus({ status: 'error', error: 'No valid recipients' });
            return;
        }

        // Check for duplicates
        const duplicates = findDuplicateAddresses(validRecipients);
        if (duplicates.length > 0) {
            setTxStatus({
                status: 'error',
                error: `Duplicate addresses found: ${duplicates.length}`,
            });
            return;
        }

        setTxStatus({ status: 'preparing' });

        try {
            // Prepare data
            const recipientAddresses = validRecipients.map(r => r.address as `0x${string}`);
            // Calculate total and individual amounts in appropriate units
            const decimals = selectedToken.decimals;
            const amounts = validRecipients.map(r => parseUnits(r.amount, decimals));

            const totalAmountWei = amounts.reduce((a, b) => a + b, BigInt(0));

            if (selectedToken.isNative) {
                // Send Native Token
                setTxStatus({ status: 'pending' });
                const hash = await writeContractAsync({
                    address: contractAddress,
                    abi: MULTISEND_ABI,
                    functionName: 'multiSendNative',
                    args: [recipientAddresses, amounts],
                    value: totalAmountWei,
                });
                setTxStatus({ status: 'success', hash });
            } else {
                // Send ERC20 Token
                if (!publicClient) throw new Error('Network client not ready');

                // 1. Check Allowance
                const allowance = await publicClient.readContract({
                    address: selectedToken.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [address as `0x${string}`, contractAddress],
                }) as bigint;

                if (allowance < totalAmountWei) {
                    setTxStatus({ status: 'preparing' }); // Logic could allow a specific "approving" state

                    // Approve
                    const approveHash = await writeContractAsync({
                        address: selectedToken.address as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [contractAddress, totalAmountWei],
                    });

                    // Wait for approval
                    setTxStatus({ status: 'pending' }); // "Pending Approval confirmation"
                    await publicClient.waitForTransactionReceipt({ hash: approveHash });
                }

                // 2. MultiSend
                setTxStatus({ status: 'pending' });
                const hash = await writeContractAsync({
                    address: contractAddress,
                    abi: MULTISEND_ABI,
                    functionName: 'multiSendToken',
                    args: [
                        selectedToken.address as `0x${string}`,
                        recipientAddresses,
                        amounts,
                        totalAmountWei
                    ],
                });

                setTxStatus({ status: 'success', hash });
            }
        } catch (error) {
            console.error('Transaction error:', error);
            setTxStatus({
                status: 'error',
                error: error instanceof Error ? (error.message.includes('User rejected') ? 'Transaction rejected' : error.message) : 'Transaction failed',
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                {/* Network Selection */}
                <section className={styles.section}>
                    <NetworkSelector />
                </section>

                {/* Token Selection */}
                <section className={styles.section}>
                    <TokenSelector
                        selectedToken={selectedToken}
                        onSelectToken={setSelectedToken}
                    />
                </section>

                {/* Recipients */}
                <section className={styles.section}>
                    <div className={styles.recipientHeader}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsBulkImportOpen(true)}
                        >
                            <Upload size={16} />
                            Bulk Import
                        </button>

                        {recipients.length > 1 && (
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleClearAll}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <RecipientList
                        recipients={recipients}
                        onUpdateRecipient={handleUpdateRecipient}
                        onRemoveRecipient={handleRemoveRecipient}
                        onAddRecipient={handleAddRecipient}
                        tokenSymbol={selectedToken?.symbol || 'TOKEN'}
                    />
                </section>
            </div>

            {/* Sidebar - Transaction Summary */}
            <aside className={styles.sidebar}>
                <TransactionSummary
                    recipients={recipients}
                    token={selectedToken}
                    chainId={chainId}
                    txStatus={txStatus}
                    onSend={handleSend}
                />
            </aside>

            {/* Bulk Import Modal */}
            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onImport={handleBulkImport}
            />
        </div>
    );
}
