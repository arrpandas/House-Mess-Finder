import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, GraduationCap } from "lucide-react";

export default function AppMenu() {
  const [location] = useLocation();

  const isHome = location === "/";
  const isTuition = location === "/tuition-tracker" || location.startsWith("/tuition-tracker/");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Menu
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/">
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="flex-1">House Hunting</span>
              {isHome && <span className="text-xs text-primary font-semibold">Active</span>}
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/tuition-tracker">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="flex-1">Tuition Tracker</span>
              {isTuition && <span className="text-xs text-primary font-semibold">Active</span>}
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

