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
    
    // Fix common encoding artifacts (mojibake from UTF-8 stored as Latin-1)
    sanitized = sanitized.replace(/\uFFFD/g, "'"); // Replacement character → apostrophe
    sanitized = sanitized.replace(/â€™/g, "\u2019"); // Right single quote
    sanitized = sanitized.replace(/â€˜/g, "\u2018"); // Left single quote
    sanitized = sanitized.replace(/â€œ/g, "\u201C"); // Left double quote
    sanitized = sanitized.replace(/â€\u009D/g, "\u201D"); // Right double quote
    sanitized = sanitized.replace(/â€"/g, "\u2014"); // Em dash
    sanitized = sanitized.replace(/â€"/g, "\u2013"); // En dash
    sanitized = sanitized.replace(/â€¦/g, "\u2026"); // Ellipsis
    sanitized = sanitized.replace(/Ã©/g, "é");
    sanitized = sanitized.replace(/Ã¨/g, "è");
    sanitized = sanitized.replace(/Ã¢/g, "â");
    
    // Remove script tags and their content (unless explicitly allowed)
    if (!allowScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocol in href/src
    sanitized = sanitized.replace(/javascript:/gi, '');
    
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

