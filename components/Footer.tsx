import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 text-center text-sm text-slate-500 border-t border-slate-200 mt-auto bg-slate-50 print:hidden">
      <p>
        &copy; {currentYear} All Rights Reserved. Developed by:{' '}
        <a 
          href="https://shakilmahmud.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium hover:underline"
        >
          Shakil Mahmud
        </a>
      </p>
    </footer>
  );
};
