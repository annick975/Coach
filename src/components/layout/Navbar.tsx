import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">SecurityScanner</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
          </nav>
          <Link href="/">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </div>

        <div className="flex md:hidden flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
