import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <header className="flex justify-center">
      <nav
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-2 
        w-[90%] md:w-auto md:min-w-[500px] lg:min-w-[600px]
        bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-full transition-all duration-300"
        data-aos="fade-down"
        data-aos-duration="1500"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <img
              src="/logo.png"
              alt="IntelliMap Logo"
              className="relative w-8 h-8 md:w-10 md:h-10 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <h1 className="hidden sm:block text-xl md:text-2xl font-bold text-white drop-shadow-lg tracking-wide">
            IntelliMap
          </h1>
        </Link>

        {/* Navigation Links / Auth */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Auth buttons */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="rounded-full bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all duration-300 font-medium px-6 shadow-lg shadow-white/10">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="hover:scale-105 transition-transform duration-300 rounded-full p-0.5">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 md:w-9 md:h-9"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
