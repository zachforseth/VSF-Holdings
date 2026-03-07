/**
 * Validates a Canadian SIN using length, format, and Luhn algorithm.
 * Safe for client-side use (does not rely on Node crypto).
 */
export function validateSINClient(sin: string): boolean {
    const cleaned = sin.replace(/\D/g, '');
    if (cleaned.length !== 9) return false;

    // Reject known invalid prefix
    if (/^000/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (i % 2 !== 0) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }

    return sum % 10 === 0;
}
