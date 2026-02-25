"use client";

interface AdminSkeletonProps {
  /** Number of rows to render */
  rows?: number;
  /** Show card-style skeleton instead of table rows */
  variant?: 'table' | 'cards' | 'stats';
}

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export default function AdminSkeleton({ rows = 5, variant = 'table' }: AdminSkeletonProps) {
  if (variant === 'stats') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
              <Pulse className="h-4 w-24 mb-3" />
              <Pulse className="h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
          <Pulse className="h-6 w-48 mb-4" />
          <Pulse className="h-4 w-full max-w-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <Pulse className="h-40 w-full rounded-lg mb-4" />
            <Pulse className="h-5 w-3/4 mb-2" />
            <Pulse className="h-4 w-1/2 mb-3" />
            <div className="flex gap-2">
              <Pulse className="h-8 w-20 rounded-full" />
              <Pulse className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table variant (default)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
      {/* Table header */}
      <div className="border-b border-gray-100 p-4 flex gap-4">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-4 w-24 hidden md:block" />
        <Pulse className="h-4 w-20 hidden md:block" />
        <Pulse className="h-4 w-16 ml-auto" />
      </div>
      {/* Table rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-gray-50 p-4 flex items-center gap-4">
          <Pulse className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-4 w-48" />
            <Pulse className="h-3 w-32" />
          </div>
          <Pulse className="h-4 w-20 hidden md:block" />
          <Pulse className="h-6 w-16 rounded-full hidden md:block" />
          <Pulse className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
