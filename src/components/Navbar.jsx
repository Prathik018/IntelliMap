import { useState } from "react";
import { Link } from "react-router-dom"; // <- use this
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full shadow-sm bg-white px-4 py-4 md:px-6 flex items-center justify-between relative">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img src="/logo.png" alt="IntelliMap Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-gray-900">IntelliMap</h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-black text-white hover:bg-black/80">Sign In</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Link to="/">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
        </Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden flex flex-col gap-2 p-4">
          <Button className="w-full">Features</Button>

          <SignedOut>
            <SignInButton mode="modal">
              <Button className="w-full">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      )}
    </nav>
  );
}
