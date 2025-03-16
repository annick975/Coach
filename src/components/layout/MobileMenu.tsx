import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Home, Settings } from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>SecurityScanner</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-8">
          <Link href="/" onClick={onClose}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/settings" onClick={onClose}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link href="/" onClick={onClose}>
            <Button className="w-full mt-4">
              <Search className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
