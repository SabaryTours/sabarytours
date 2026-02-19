"use client";

import { useMemo } from "react";

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowScripts?: boolean; // Default: false for security
}

/**
 * SafeHTML Component
 * 
 * Renders HTML content safely using dangerouslySetInnerHTML.
 * 
 * IMPORTANT SECURITY NOTES:
 * - Only use this component with trusted HTML content
 * - The HTML is sanitized to remove script tags by default
 * - Always validate your data source before rendering
 * 
 * @param html - The HTML string to render
 * @param className - Optional CSS classes
 * @param allowScripts - Whether to allow script tags (NOT RECOMMENDED)
 */
export default function SafeHTML({ 
  html, 
  className = "", 
  allowScripts = false 
}: SafeHTMLProps) {
  // Sanitize HTML to remove potentially dangerous content
  const sanitizedHTML = useMemo(() => {
    if (!html) return "";
    
    let sanitized = html;
    
    // Remove script tags and their content (unless explicitly allowed)
    if (!allowScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocol in href/src
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: URLs that could be dangerous (optional - uncomment if needed)
    // sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
    
    return sanitized;
  }, [html, allowScripts]);

  if (!sanitizedHTML) {
    return null;
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}

