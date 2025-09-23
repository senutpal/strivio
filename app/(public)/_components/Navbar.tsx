"use client";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md lg:px-12 md:px-8 px-4 ">
      <div className="relative flex min-h-16 items-center px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={logo} alt="Logo" className="w-9 h-9" />
          <span className="font-bold">Strivio</span>
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 ">
          <div className="flex items-center gap-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors
                  ${isActive ? "text-primary " : "text-muted-foreground hover:text-foreground"}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex items-center space-x-3">
          <ThemeToggle />
          {isPending ? null : session ? (
            <UserDropdown
              email={session.user.email}
              image={session.user.image || ""}
              name={session.user.name}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                })}
              >
                Login
              </Link>
              {/* <Link href="/login" className={buttonVariants({})}>
                Get Started
              </Link> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
