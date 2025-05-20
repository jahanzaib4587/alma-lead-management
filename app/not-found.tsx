'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#DCE4B1] rounded-full flex items-center justify-center text-2xl font-bold">
            404
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
          >
            Go to Assessment Form
          </Link>
          
          <Link 
            href="/login"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition"
          >
            Go to Admin Login
          </Link>
          
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to assessment form in {countdown} seconds...
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute left-0 bottom-0 w-full h-1/3 overflow-hidden pointer-events-none opacity-50">
        <div className="w-36 h-36 rounded-full bg-[#c5d48a] absolute -bottom-12 -left-16"></div>
        <div className="w-32 h-32 rounded-full bg-[#d0dd9c] absolute -bottom-6 -left-6"></div>
        <div className="w-36 h-36 rounded-full bg-[#c5d48a] absolute -bottom-12 -right-16"></div>
        <div className="w-48 h-48 rounded-full bg-gray-100 absolute top-12 -right-24"></div>
      </div>
    </div>
  );
} 