import type { ErrorWithCode } from '@/types';

/**
 * Error handler utility for Web3 transactions
 */
export class TransactionError extends Error {
    code?: string;
    reason?: string;

    constructor(message: string, code?: string, reason?: string) {
        super(message);
        this.name = 'TransactionError';
        this.code = code;
        this.reason = reason;
    }
}

/**
 * Parse error from Web3 transaction
 */
export function parseTransactionError(error: unknown): TransactionError {
    if (error instanceof TransactionError) {
        return error;
    }

    const err = error as ErrorWithCode;

    // User rejected transaction
    if (err.code === 'ACTION_REJECTED' || err.code === '4001') {
        return new TransactionError(
            'Transaction was rejected by user',
            'USER_REJECTED',
            'User declined the transaction'
        );
    }

    // Insufficient funds
    if (err.code === 'INSUFFICIENT_FUNDS' || err.message?.includes('insufficient funds')) {
        return new TransactionError(
            'Insufficient balance to complete transaction',
            'INSUFFICIENT_FUNDS',
            'Not enough ETH or tokens'
        );
    }

    // Gas estimation failed
    if (err.message?.includes('gas') || err.message?.includes('execution reverted')) {
        return new TransactionError(
            'Transaction would fail - please check your inputs',
            'EXECUTION_REVERTED',
            err.reason || 'Transaction simulation failed'
        );
    }

    // Network error
    if (err.message?.includes('network') || err.message?.includes('connection')) {
        return new TransactionError(
            'Network connection error',
            'NETWORK_ERROR',
            'Please check your internet connection'
        );
    }

    // Generic error
    return new TransactionError(
        err.message || 'An unknown error occurred',
        err.code || 'UNKNOWN_ERROR',
        err.reason
    );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    const txError = parseTransactionError(error);

    switch (txError.code) {
        case 'USER_REJECTED':
            return 'You cancelled the transaction';
        case 'INSUFFICIENT_FUNDS':
            return 'Insufficient balance. Please add more funds to your wallet';
        case 'EXECUTION_REVERTED':
            return 'Transaction would fail. Please verify recipient addresses and amounts';
        case 'NETWORK_ERROR':
            return 'Network connection issue. Please try again';
        default:
            return txError.message;
    }
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
    const txError = parseTransactionError(error);
    console.error(`[${context || 'Error'}]`, {
        message: txError.message,
        code: txError.code,
        reason: txError.reason,
        stack: txError.stack,
    });
}
