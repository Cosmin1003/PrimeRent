"use client";

import { Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom"; // Added for routing
import { supabase } from "../supabaseClient"; // Import your client
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
  user: any;
  className?: string;
}

const Navbar1 = ({ user, className }: NavbarProps) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50 py-4",
        className,
      )}
    >
      <div className="container max-w-7xl mx-auto px-6">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          {/* Left: Logo (Now separate) */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-3xl font-black tracking-tighter text-black">
                PRIME<span className="text-emerald-600">RENT</span>
              </span>
            </Link>
          </div>

          {/* Middle: Navigation Menu (Centered) */}
          <div className="flex-1 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-10">
                {" "}
                {/* Increased gap for a cleaner look */}
                <NavigationMenuItem>
                  <Link
                    to="/"
                    className="text-[19px] font-bold text-black hover:text-emerald-600 transition-colors"
                  >
                    Discover
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    to="/"
                    className="text-[19px] font-bold text-black hover:text-emerald-600 transition-colors"
                  >
                    Properties
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  {user.email.split("@")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50 font-bold"
                >
                  <LogOut className="mr-2 size-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-black hover:bg-emerald-600 rounded-full px-8 py-5 transition-all "
              >
                <Link to="/auth">Log in</Link>
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tighter text-black">
                PRIME<span className="text-emerald-600">RENT</span>
              </span>
            </Link>
            <Sheet>
              <SheetTrigger>
                <Button variant="outline" size="icon" asChild>
                  <div>
                    <Menu className="size-4" />
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <span className="text-xl font-black tracking-tighter">
                      PRIME<span className="text-emerald-600">RENT</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <div className="flex flex-col gap-4">
                    <Link to="/" className="text-md font-semibold">
                      Discover
                    </Link>
                    <Link to="/" className="text-md font-semibold">
                      Properties
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3">
                    {user ? (
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full cursor-pointer"
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-black">
                        <Link to="/auth">Log in</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar1 };
