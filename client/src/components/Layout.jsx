import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, showBack, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBack={showBack} title={title} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
