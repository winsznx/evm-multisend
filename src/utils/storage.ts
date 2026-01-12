/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    RECENT_RECIPIENTS: 'multisend_recent_recipients',
    RECENT_TOKENS: 'multisend_recent_tokens',
    USER_PREFERENCES: 'multisend_preferences',
    LAST_NETWORK: 'multisend_last_network',
} as const;

/**
 * Get item from local storage with type safety
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Set item in local storage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
        return false;
    }
}

/**
 * Remove item from local storage
 */
export function removeStorageItem(key: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        window.localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage key "${key}":`, error);
        return false;
    }
}

/**
 * Clear all app storage
 */
export function clearAppStorage(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        Object.values(STORAGE_KEYS).forEach((key) => {
            window.localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing app storage:', error);
        return false;
    }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}
