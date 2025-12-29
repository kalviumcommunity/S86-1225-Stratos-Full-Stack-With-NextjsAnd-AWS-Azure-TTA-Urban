'use client';

import { sanitizeHTML, sanitizePlainText, htmlEncode, createSafeLink } from '@/app/lib/sanitize.client';

interface SafeContentProps {
  content: string;
  type?: 'html' | 'text' | 'encoded';
  className?: string;
}

/**
 * SafeContent Component
 * Safely renders user-generated content with proper sanitization
 * 
 * Props:
 * - content: The user-generated content to display
 * - type: How to sanitize the content:
 *   - 'html': Allows safe HTML tags (using DOMPurify)
 *   - 'text': Strips all HTML (safest option)
 *   - 'encoded': HTML entity encoding
 * - className: Optional CSS classes
 * 
 * Example Usage:
 * <SafeContent content={userInput} type="text" />
 */
export function SafeContent({ content, type = 'text', className = '' }: SafeContentProps) {
  if (!content) return null;

  switch (type) {
    case 'html':
      // Allow safe HTML tags - removes scripts, event handlers, etc.
      return (
        <div 
          className={className}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
        />
      );
    
    case 'encoded':
      // HTML entity encoding - displays HTML as text
      return (
        <div className={className}>
          {htmlEncode(content)}
        </div>
      );
    
    case 'text':
    default:
      // Safest option - removes all HTML
      return (
        <div className={className}>
          {sanitizePlainText(content)}
        </div>
      );
  }
}

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
}

/**
 * SafeLink Component
 * Creates a safe link with proper security attributes
 * - Validates URL to prevent javascript: and data: protocols
 * - Adds rel="noopener noreferrer" for external links
 * 
 * Example:
 * <SafeLink href={userProvidedUrl}>Click here</SafeLink>
 */
export function SafeLink({ href, children, className = '', target }: SafeLinkProps) {
  const safeLink = createSafeLink(href, target);
  
  if (!safeLink) {
    // Invalid URL - render as plain text
    return <span className={className}>{children}</span>;
  }

  return (
    <a 
      href={safeLink.href}
      target={safeLink.target}
      rel={safeLink.rel}
      className={className}
    >
      {children}
    </a>
  );
}

interface SafeUserProfileProps {
  name: string;
  bio?: string;
  email?: string;
  website?: string;
}

/**
 * Example Component: Safe User Profile Display
 * Demonstrates best practices for displaying user-generated content
 */
export function SafeUserProfile({ name, bio, email, website }: SafeUserProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Name: Strip all HTML for safety */}
      <h2 className="text-2xl font-bold mb-2">
        <SafeContent content={name} type="text" />
      </h2>

      {/* Email: Display as plain text */}
      {email && (
        <p className="text-gray-600 mb-4">
          <SafeContent content={email} type="text" />
        </p>
      )}

      {/* Bio: Allow safe HTML formatting (bold, italic, links) */}
      {bio && (
        <div className="mb-4 text-gray-700">
          <h3 className="font-semibold mb-1">About:</h3>
          <SafeContent content={bio} type="html" className="prose" />
        </div>
      )}

      {/* Website: Safe link with validation */}
      {website && (
        <div>
          <h3 className="font-semibold mb-1">Website:</h3>
          <SafeLink href={website} className="text-blue-600 hover:underline" target="_blank">
            {sanitizePlainText(website)}
          </SafeLink>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Complaint Display with Sanitization
 */
interface ComplaintDisplayProps {
  title: string;
  description: string;
  status: string;
}

export function SafeComplaintDisplay({ title, description, status }: ComplaintDisplayProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      {/* Title: Plain text only */}
      <h3 className="text-lg font-semibold mb-2">
        <SafeContent content={title} type="text" />
      </h3>

      {/* Status badge */}
      <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 mb-3">
        {status}
      </span>

      {/* Description: Allow safe HTML but sanitize */}
      <div className="text-gray-700">
        <SafeContent content={description} type="html" className="prose max-w-none" />
      </div>

      {/* Show raw encoded version for comparison (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-gray-500">Show HTML Encoded Version</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
            <SafeContent content={description} type="encoded" />
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Example: Comment Section with XSS Protection
 */
interface CommentProps {
  author: string;
  content: string;
  timestamp: string;
}

export function SafeComment({ author, content, timestamp }: CommentProps) {
  return (
    <div className="border-l-4 border-gray-300 pl-4 py-2 mb-3">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold">
          <SafeContent content={author} type="text" />
        </span>
        <span className="text-sm text-gray-500">{timestamp}</span>
      </div>
      <div className="text-gray-700">
        {/* Comments: Plain text only - no HTML allowed */}
        <SafeContent content={content} type="text" />
      </div>
    </div>
  );
}
