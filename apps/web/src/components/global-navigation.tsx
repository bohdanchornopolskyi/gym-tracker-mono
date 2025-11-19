"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Bookmark,
  Dumbbell,
  History,
  HomeIcon,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";

export default function GlobalNavigation({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 bg-background border shadow-sm hover:bg-accent z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="md:mt-0 mt-16">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <DesktopMenu />
      <div className="flex-1">
        <MobileMenu />
        <div className="md:mt-0 mt-16">{children}</div>
      </div>
    </div>
  );
}

function DesktopMenu() {
  return (
    <aside className="hidden md:flex w-48 border-r bg-muted/40 p-2">
      <nav className="flex h-full max-h-screen flex-col gap-2">
        <MenuLink href="/">
          <HomeIcon className="h-4 w-4" />
          Home
        </MenuLink>
        <MenuLink href="/gym">
          <Activity className="h-4 w-4" />
          Dashboard
        </MenuLink>
        <MenuLink href="/gym/exercises">
          <Dumbbell className="h-4 w-4" />
          Exercises
        </MenuLink>
        <MenuLink href="/gym/presets">
          <Bookmark className="h-4 w-4" />
          Presets
        </MenuLink>
        <MenuLink href="/gym/history">
          <History className="h-4 w-4" />
          History
        </MenuLink>
        <MenuLink href="/gym/analytics">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </MenuLink>
        <ModeToggle />
      </nav>
    </aside>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 bg-background border shadow-sm hover:bg-accent z-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Gym Tracker</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-8">
          <MenuLink href="/" onClick={handleLinkClick}>
            <HomeIcon className="h-4 w-4" />
            Home
          </MenuLink>
          <MenuLink href="/gym" onClick={handleLinkClick}>
            <Activity className="h-4 w-4" />
            Dashboard
          </MenuLink>
          <MenuLink href="/gym/exercises" onClick={handleLinkClick}>
            <Dumbbell className="h-4 w-4" />
            Exercises
          </MenuLink>
          <MenuLink href="/gym/presets" onClick={handleLinkClick}>
            <Bookmark className="h-4 w-4" />
            Presets
          </MenuLink>
          <MenuLink href="/gym/history" onClick={handleLinkClick}>
            <History className="h-4 w-4" />
            History
          </MenuLink>
          <MenuLink href="/gym/analytics" onClick={handleLinkClick}>
            <BarChart3 className="h-4 w-4" />
            Analytics
          </MenuLink>
          <ModeToggle />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary",
      )}
    >
      {children}
    </Link>
  );
}
