import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'cards';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-5 bg-[#101C30] rounded-xl border border-[rgba(148,163,184,0.14)]">
            <div className="h-4 bg-[#15243B] rounded-md w-1/3 mb-3" />
            <div className="h-3 bg-[#15243B]/60 rounded-md w-2/3 mb-2" />
            <div className="h-3 bg-[#15243B]/60 rounded-md w-1/2 mb-4" />
            <div className="h-6 bg-[#15243B]/80 rounded-full w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#101C30] rounded-xl border border-[rgba(148,163,184,0.14)] overflow-hidden animate-pulse">
      <div className="px-6 py-3.5 bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] flex gap-4">
        <div className="h-4 bg-[#15243B] rounded-md w-1/6" />
        <div className="h-4 bg-[#15243B] rounded-md w-1/4" />
        <div className="h-4 bg-[#15243B] rounded-md w-1/5" />
        <div className="h-4 bg-[#15243B] rounded-md w-1/6" />
        <div className="h-4 bg-[#15243B] rounded-md w-1/12 ml-auto" />
      </div>
      <div className="divide-y divide-[rgba(148,163,184,0.08)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <div className="h-3.5 bg-[#15243B] rounded-md w-1/6" />
            <div className="h-3 bg-[#15243B]/60 rounded-md w-1/4" />
            <div className="h-3 bg-[#15243B]/60 rounded-md w-1/5" />
            <div className="h-3 bg-[#15243B]/60 rounded-md w-1/6" />
            <div className="h-3.5 bg-[#15243B] rounded-md w-1/12 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
