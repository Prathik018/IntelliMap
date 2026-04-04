import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

export default function Navbar() {
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Process', href: '#process' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Logo"
              className="w-26 h-26 md:w-26 md:h-26 lg:w-32 lg:h-32 object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(link.href)
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="rounded-full bg-black text-white hover:bg-gray-800 transition-all font-medium px-6 h-10">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link to="/dashboard">
                <Button variant="ghost" className="mr-4">
                  Workspace
                </Button>
              </Link>
              <div className="w-[42px] h-[42px] md:w-[42px] md:h-[42px] flex items-center justify-center">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: {
                        width: '100%',
                        height: '100%',
                        maxWidth: 'none',
                        maxHeight: 'none',
                      },
                      userButtonTrigger: {
                        width: '100%',
                        height: '100%',
                        maxWidth: 'none',
                        maxHeight: 'none',
                      },
                      userButtonAvatarImage: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      },
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
