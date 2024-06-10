import Cookies from '../../../node_modules/@types/js-cookie'

/**
 * Get a cookie by name.
 * @param {string} name - The name of the cookie.
 * @returns {string} - The value of the cookie, or an empty string if not found.
 */
export const getCookie = (name: string): string => {
    return Cookies.get(name) ?? '';
};

/**
 * Delete a cookie by name.
 * @param {string} name - The name of the cookie to delete.
 */
export const deleteCookie = (name: string): void => {
    Cookies.remove(name);
};

/**
 * Set a cookie with name, value, and optional attributes.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {CookieAttributes} [options] - Optional attributes for the cookie (e.g., expires, path, domain).
 */
export const setCookie = (name: string, value: string, options?: any): void => {
    Cookies.set(name, value, options);
};
