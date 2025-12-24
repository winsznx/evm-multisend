import type { ParsedRecipient, Recipient } from '@/types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

/**
 * Validate an Ethereum address
 */
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate an amount string
 */
export function isValidAmount(amount: string): boolean {
    if (!amount || amount.trim() === '') return false;
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
}

/**
 * Format an address for display (truncated)
 */
export function formatAddress(address: string, chars: number = 6): string {
    if (!address) return '';
    if (address.length <= chars * 2 + 2) return address;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a number for display
 */
export function formatNumber(
    value: string | number,
    decimals: number = 4
): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';

    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/**
 * Parse pasted text into recipients
 * Supports formats:
 * - address,amount
 * - address amount
 * - address=amount
 * - address;amount
 * Each on a new line
 */
export function parseRecipients(text: string): ParsedRecipient[] {
    const lines = text.trim().split('\n');
    const recipients: ParsedRecipient[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Try different separators
        let parts: string[] = [];
        if (trimmedLine.includes(',')) {
            parts = trimmedLine.split(',');
        } else if (trimmedLine.includes(';')) {
            parts = trimmedLine.split(';');
        } else if (trimmedLine.includes('=')) {
            parts = trimmedLine.split('=');
        } else if (trimmedLine.includes(' ')) {
            parts = trimmedLine.split(/\s+/);
        } else {
            // Just address, no amount
            parts = [trimmedLine];
        }

        const address = parts[0]?.trim() || '';
        const amount = parts[1]?.trim() || '';

        if (address) {
            recipients.push({ address, amount });
        }
    }

    return recipients;
}

/**
 * Create a recipient object from parsed data
 */
export function createRecipient(address: string = '', amount: string = ''): Recipient {
    return {
        id: generateId(),
        address,
        amount,
        isValid: isValidAddress(address) && (amount === '' || isValidAmount(amount)),
    };
}

/**
 * Validate a recipient
 */
export function validateRecipient(recipient: Recipient): boolean {
    return isValidAddress(recipient.address) && isValidAmount(recipient.amount);
}

/**
 * Calculate total amount from recipients
 */
export function calculateTotalAmount(recipients: Recipient[]): string {
    const total = recipients.reduce((sum, recipient) => {
        const amount = parseFloat(recipient.amount) || 0;
        return sum + amount;
    }, 0);
    return total.toString();
}

/**
 * Count valid recipients
 */
export function countValidRecipients(recipients: Recipient[]): number {
    return recipients.filter(validateRecipient).length;
}

/**
 * Check for duplicate addresses
 */
export function findDuplicateAddresses(recipients: Recipient[]): string[] {
    const addressCount: Record<string, number> = {};

    for (const recipient of recipients) {
        const addr = recipient.address.toLowerCase();
        if (addr && isValidAddress(recipient.address)) {
            addressCount[addr] = (addressCount[addr] || 0) + 1;
        }
    }

    return Object.entries(addressCount)
        .filter(([, count]) => count > 1)
        .map(([addr]) => addr);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Format token balance with symbol
 */
export function formatBalance(balance: string, symbol: string, decimals: number = 4): string {
    return `${formatNumber(balance, decimals)} ${symbol}`;
}

/**
 * Get block explorer URL for a transaction
 */
export function getTxExplorerUrl(hash: string, explorerUrl?: string): string {
    if (!explorerUrl) return '';
    return `${explorerUrl}/tx/${hash}`;
}

/**
 * Get block explorer URL for an address
 */
export function getAddressExplorerUrl(address: string, explorerUrl?: string): string {
    if (!explorerUrl) return '';
    return `${explorerUrl}/address/${address}`;
}
