/**
 * Storage Utility
 * 
 * Replaces React Native's SecureStore with Web's localStorage.
 * Handles token storage securely (as much as possible in web).
 */

class StorageUtil {
    /**
     * Set item in local storage
     */
    async setItem(key: string, value: string): Promise<void> {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting item in storage:', error);
        }
    }

    /**
     * Get item from local storage
     */
    async getItem(key: string): Promise<string | null> {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }

    /**
     * Delete item from local storage
     */
    async deleteItem(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error deleting item from storage:', error);
        }
    }

    /**
     * Clear all items
     */
    async clear(): Promise<void> {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}

export const storage = new StorageUtil();
export const secureStorage = storage; // Alias for compatibility with mobile code
