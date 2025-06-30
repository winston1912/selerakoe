'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Ingredients', href: '/ingredients' },
    { name: 'Recipes', href: '/recipes' },
    { name: 'Recipe-ingredients', href: '/recipe-ingredients' }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-amber-50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-900 hover:text-red-800 transition-colors">
              Recipe Hub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-red-900 hover:bg-red-100 hover:text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent hover:border-red-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-red-900 hover:text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors"
              aria-expanded={mounted ? isOpen : false}
            >
              <span className="sr-only">Open main menu</span>
              {mounted && isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mounted && (
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-amber-100 border-t border-red-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-red-900 hover:bg-red-200 hover:text-red-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;