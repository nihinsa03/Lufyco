// Email validation utilities

// List of supported email providers
const SUPPORTED_EMAIL_PROVIDERS = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'protonmail.com',
    'aol.com',
    'mail.com',
    'zoho.com',
];

/**
 * Validates if email is in correct format
 * @param email - Email address to validate
 * @returns true if email is valid format
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return false;

    // RFC 5322 compliant email regex (simplified version)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Checks if email is a Gmail address
 * @param email - Email address to check
 * @returns true if email ends with @gmail.com
 */
export const isGmailEmail = (email: string): boolean => {
    if (!email) return false;
    return email.toLowerCase().trim().endsWith('@gmail.com');
};

/**
 * Checks if email provider is in the supported list
 * @param email - Email address to check
 * @returns true if email provider is supported
 */
export const isSupportedEmailProvider = (email: string): boolean => {
    if (!email) return false;

    const emailLower = email.toLowerCase().trim();
    return SUPPORTED_EMAIL_PROVIDERS.some(provider =>
        emailLower.endsWith(`@${provider}`)
    );
};

/**
 * Gets the email provider from email address
 * @param email - Email address
 * @returns Email provider domain or empty string
 */
export const getEmailProvider = (email: string): string => {
    if (!email) return '';

    const parts = email.trim().split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : '';
};

/**
 * Get list of supported email providers
 * @returns Array of supported email domains
 */
export const getSupportedEmailProviders = (): string[] => {
    return [...SUPPORTED_EMAIL_PROVIDERS];
};

/**
 * Get email validation error message
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export const getEmailValidationError = (email: string): string => {
    if (!email || email.trim() === '') {
        return 'Email is required';
    }

    if (!validateEmail(email)) {
        return 'Please enter a valid email address';
    }

    if (!isSupportedEmailProvider(email)) {
        const provider = getEmailProvider(email);
        return `Email provider "${provider}" is not supported. Please use Gmail, Yahoo, Outlook, or other common providers.`;
    }

    return ''; // No error
};
