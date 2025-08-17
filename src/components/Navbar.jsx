import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <nav
      className="w-full fixed top-0 left-0 z-50 px-4 py-4 md:px-6 flex items-center justify-between
      bg-gradient-to-r from-white/10 via-white/5 to-white/10 
      backdrop-blur-2xl border border-white/10 shadow-lg rounded-lg"
       data-aos="fade-right"
        data-aos-duration="2500"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 px-10">
        <img src="/logo.png" alt="IntelliMap Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-white drop-shadow-md">IntelliMap</h1>
      </Link>

      {/* Right Side: Sign In or Avatar */}
      <div className="flex gap-4 items-center px-10">
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-white text-black hover:bg-gray-200 backdrop-blur-sm">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-12 h-12", // avatar container size
                avatar: "w-12 h-12",    // actual avatar
                userButtonPopoverCard: "shadow-xl",
                userPreviewMainIdentifier: "font-semibold",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}
