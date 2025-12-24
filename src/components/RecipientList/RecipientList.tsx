'use client';

import { X, Plus } from 'lucide-react';
import { type Recipient } from '@/types';
import { isValidAddress, isValidAmount } from '@/utils';
import styles from './RecipientList.module.css';

interface RecipientListProps {
    recipients: Recipient[];
    onUpdateRecipient: (id: string, field: 'address' | 'amount', value: string) => void;
    onRemoveRecipient: (id: string) => void;
    onAddRecipient: () => void;
    tokenSymbol: string;
}

export default function RecipientList({
    recipients,
    onUpdateRecipient,
    onRemoveRecipient,
    onAddRecipient,
    tokenSymbol,
}: RecipientListProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recipients</h3>
                <span className={styles.count}>{recipients.length} address{recipients.length !== 1 ? 'es' : ''}</span>
            </div>

            <div className={styles.listHeader}>
                <div className={styles.colNumber}>#</div>
                <div className={styles.colAddress}>Address</div>
                <div className={styles.colAmount}>Amount ({tokenSymbol})</div>
                <div className={styles.colAction}></div>
            </div>

            <div className={styles.list}>
                {recipients.map((recipient, index) => {
                    const isAddressValid = !recipient.address || isValidAddress(recipient.address);
                    const isAmountValid = !recipient.amount || isValidAmount(recipient.amount);

                    return (
                        <div key={recipient.id} className={styles.row}>
                            <div className={styles.colNumber}>
                                <span className={styles.number}>{index + 1}</span>
                            </div>

                            <div className={styles.colAddress}>
                                <input
                                    type="text"
                                    className={`input ${styles.addressInput} ${!isAddressValid ? styles.inputError : ''}`}
                                    placeholder="0x..."
                                    value={recipient.address}
                                    onChange={(e) => onUpdateRecipient(recipient.id, 'address', e.target.value)}
                                    spellCheck={false}
                                />
                                {recipient.address && !isAddressValid && (
                                    <span className={styles.errorText}>Invalid address</span>
                                )}
                            </div>

                            <div className={styles.colAmount}>
                                <input
                                    type="text"
                                    className={`input ${styles.amountInput} ${!isAmountValid ? styles.inputError : ''}`}
                                    placeholder="0.0"
                                    value={recipient.amount}
                                    onChange={(e) => onUpdateRecipient(recipient.id, 'amount', e.target.value)}
                                    inputMode="decimal"
                                />
                            </div>

                            <div className={styles.colAction}>
                                {recipients.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => onRemoveRecipient(recipient.id)}
                                        aria-label="Remove recipient"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                className={styles.addBtn}
                onClick={onAddRecipient}
            >
                <Plus size={16} />
                Add Recipient
            </button>
        </div>
    );
}
