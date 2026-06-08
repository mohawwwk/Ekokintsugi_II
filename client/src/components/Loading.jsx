import React from 'react';

const Loading = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-b-2',
    lg: 'h-16 w-16 border-b-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-primary-600`}></div>
      <p className="text-primary-800 font-medium animate-pulse">Loading EkoKintsugi...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white/80 backdrop-blur-sm fixed inset-0 z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
