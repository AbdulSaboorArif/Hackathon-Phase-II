/**
 * ChatLayout component - Layout wrapper for chat interface.
 *
 * Provides header and navigation for the chat page.
 */

import React from 'react';
import Link from 'next/link';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Todo Chat Assistant
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="text-sm text-blue-600 font-medium"
            >
              Chat
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
