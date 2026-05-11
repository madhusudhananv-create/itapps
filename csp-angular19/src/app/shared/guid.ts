/**
 * GUID generation utility
 * Migrated from Angular 6 to Angular 19
 * Security: Uses crypto.randomUUID() for cryptographically secure random values
 */

export class Guid {
  /**
   * Generate a new GUID/UUID v4 using cryptographically secure random values
   * Falls back to crypto.getRandomValues() for broader browser compatibility
   * @returns New GUID string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  static newGuid(): string {
    // Modern browsers support crypto.randomUUID() - cryptographically secure
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for older browsers - use crypto.getRandomValues() (still secure)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        const r = array[0] % 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Final fallback (should never happen in modern browsers)
    console.warn('⚠️ crypto API not available - using insecure Math.random() for GUID generation');
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
