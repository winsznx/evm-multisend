import type { Recipient } from '@/types';

/**
 * Constants for validation
 */
export const VALIDATION_CONSTANTS = {
    MAX_RECIPIENTS: 255,
    MIN_RECIPIENTS: 1,
    MAX_AMOUNT: '1000000000', // 1 billion
    MIN_AMOUNT: '0.000001',
    ADDRESS_LENGTH: 42,
} as const;

/**
 * Validation error types
 */
export type ValidationErrorType =
    | 'INVALID_ADDRESS'
    | 'INVALID_AMOUNT'
    | 'DUPLICATE_ADDRESS'
    | 'TOO_MANY_RECIPIENTS'
    | 'NO_RECIPIENTS'
    | 'INSUFFICIENT_BALANCE'
    | 'AMOUNT_TOO_LARGE'
    | 'AMOUNT_TOO_SMALL';

/**
 * Validation error
 */
export interface ValidationError {
    type: ValidationErrorType;
    message: string;
    field?: string;
    index?: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validate recipient list
 */
export function validateRecipients(recipients: Recipient[]): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if empty
    if (recipients.length === 0) {
        errors.push({
            type: 'NO_RECIPIENTS',
            message: 'At least one recipient is required',
        });
        return { isValid: false, errors };
    }

    // Check max recipients
    if (recipients.length > VALIDATION_CONSTANTS.MAX_RECIPIENTS) {
        errors.push({
            type: 'TOO_MANY_RECIPIENTS',
            message: `Maximum ${VALIDATION_CONSTANTS.MAX_RECIPIENTS} recipients allowed`,
        });
    }

    // Check for duplicates
    const addressMap = new Map<string, number[]>();
    recipients.forEach((recipient, index) => {
        const addr = recipient.address.toLowerCase();
        if (!addressMap.has(addr)) {
            addressMap.set(addr, []);
        }
        addressMap.get(addr)!.push(index);
    });

    addressMap.forEach((indices, address) => {
        if (indices.length > 1) {
            errors.push({
                type: 'DUPLICATE_ADDRESS',
                message: `Duplicate address found: ${address}`,
                field: 'address',
            });
        }
    });

    // Validate each recipient
    recipients.forEach((recipient, index) => {
        // Validate address
        if (!recipient.address || !/^0x[a-fA-F0-9]{40}$/.test(recipient.address)) {
            errors.push({
                type: 'INVALID_ADDRESS',
                message: `Invalid address at position ${index + 1}`,
                field: 'address',
                index,
            });
        }

        // Validate amount
        const amount = parseFloat(recipient.amount);
        if (isNaN(amount) || amount <= 0) {
            errors.push({
                type: 'INVALID_AMOUNT',
                message: `Invalid amount at position ${index + 1}`,
                field: 'amount',
                index,
            });
        } else if (amount < parseFloat(VALIDATION_CONSTANTS.MIN_AMOUNT)) {
            errors.push({
                type: 'AMOUNT_TOO_SMALL',
                message: `Amount too small at position ${index + 1}`,
                field: 'amount',
                index,
            });
        } else if (amount > parseFloat(VALIDATION_CONSTANTS.MAX_AMOUNT)) {
            errors.push({
                type: 'AMOUNT_TOO_LARGE',
                message: `Amount too large at position ${index + 1}`,
                field: 'amount',
                index,
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate balance is sufficient
 */
export function validateBalance(
    totalAmount: string,
    balance: string
): ValidationResult {
    const errors: ValidationError[] = [];

    const total = parseFloat(totalAmount);
    const bal = parseFloat(balance);

    if (isNaN(total) || isNaN(bal)) {
        errors.push({
            type: 'INVALID_AMOUNT',
            message: 'Invalid amount or balance',
        });
        return { isValid: false, errors };
    }

    if (total > bal) {
        errors.push({
            type: 'INSUFFICIENT_BALANCE',
            message: `Insufficient balance. Required: ${totalAmount}, Available: ${balance}`,
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
    if (result.isValid) {
        return 'All validations passed';
    }

    const errorCounts = result.errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const messages = Object.entries(errorCounts).map(
        ([type, count]) => `${count} ${type.toLowerCase().replace(/_/g, ' ')} error(s)`
    );

    return messages.join(', ');
}
