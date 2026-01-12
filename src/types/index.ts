/**
 * Recipient type for the application
 */
export interface Recipient {
    id: string;
    address: string;
    amount: string;
    isValid: boolean;
}

/**
 * Parsed recipient from bulk import
 */
export interface ParsedRecipient {
    address: string;
    amount: string;
}

/**
 * Token information
 */
export interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
}

/**
 * Transaction status
 */
export type TransactionStatus = 'idle' | 'preparing' | 'pending' | 'success' | 'error';

/**
 * Network information
 */
export interface NetworkInfo {
    id: number | string;
    name: string;
    symbol: string;
    isTestnet: boolean;
    blockExplorer?: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
    hash: string;
    status: 'success' | 'failed';
    blockNumber?: number;
    gasUsed?: bigint;
}

/**
 * Error with code
 */
export interface ErrorWithCode extends Error {
    code?: string;
    reason?: string;
}
