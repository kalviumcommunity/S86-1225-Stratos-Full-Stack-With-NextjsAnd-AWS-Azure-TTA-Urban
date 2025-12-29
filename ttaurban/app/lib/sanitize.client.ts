/**
 * Client-side Sanitization Utilities
 * For use in React components to safely render user content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML for safe rendering in React
 * Use with dangerouslySetInnerHTML
 * 
 * @param dirty - Potentially unsafe HTML
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userContent) }} />
 * ```
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize for strict plain text output
 * Removes all HTML tags
 * 
 * @param dirty - Input with potential HTML
 * @returns Plain text only
 */
export function sanitizePlainText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Encode special characters for safe display
 * Alternative to sanitizing when you want to show the actual input
 * 
 * @param str - String to encode
 * @returns HTML-encoded string
 */
export function htmlEncode(str: string): string {
  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // Server-side fallback: manually encode HTML entities
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely parse JSON from user input
 * Prevents prototype pollution attacks
 * 
 * @param jsonString - JSON string to parse
 * @returns Parsed object or null if invalid
 */
export function safeJSONParse<T = any>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Remove __proto__ and constructor to prevent pollution
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
      delete parsed.constructor;
    }
    
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid JSON:", error);
    return null;
  }
}

/**
 * Validate URL before using for navigation or fetch
 * Prevents javascript: and data: URL attacks
 * 
 * @param url - URL to validate
 * @returns True if URL is safe
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Create a safe link component
 * Automatically adds rel="noopener noreferrer" for external links
 * 
 * @param href - Link URL
 * @param text - Link text
 * @returns Safe link attributes
 */
export function createSafeLink(href: string, text: string) {
  const sanitizedHref = sanitizeHTML(href);
  const sanitizedText = sanitizePlainText(text);
  
  const isExternal = !sanitizedHref.startsWith('/') && 
                     !sanitizedHref.startsWith('#') &&
                     !sanitizedHref.includes(window.location.hostname);
  
  return {
    href: sanitizedHref,
    text: sanitizedText,
    rel: isExternal ? 'noopener noreferrer' : undefined,
    target: isExternal ? '_blank' : undefined,
  };
}
