"use client";
import Image from "next/image";
import logo from "@/assets/logo.png";
import Container from "./Container";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { Badge } from "../ui/badge";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Menu, X, ShoppingCart, Home, UtensilsCrossed, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const pathName = usePathname();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathName]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
    { label: "Menu", link: "/all-foods", icon: <UtensilsCrossed className="h-4 w-4" /> },
    {
      label: "Cart",
      link: "/cart",
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: itemCount,
    }
  ];

  if (user) {
    if (user.role === "admin") {
      navLinks.push({ label: "Admin", link: "/admin", icon: <User className="h-4 w-4" /> });
    } else {
      navLinks.push({ label: "Account", link: "/account", icon: <User className="h-4 w-4" /> });
    }
  } else {
    navLinks.push({ label: "Login", link: "/login", icon: <User className="h-4 w-4" /> });
  }

  return (
    <nav className="bg-primary-bg-color shadow-sm sticky top-0 z-50">
      <Container className="py-4 md:py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src={logo} alt="FreshBites logo" width={36} height={36} />
          <h1 className="text-primary-color text-xl md:text-[22px] font-bold">
            FreshBites
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((nav) => (
            <Link
              key={nav.link}
              href={nav.link}
              className={cn(
                "flex items-center gap-2 text-sm text-warm-text px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-primary-color/5",
                pathName === nav.link &&
                  "bg-primary-color text-white font-semibold hover:bg-primary-color-dark"
              )}
            >
              {nav.label === "Account" ? nav.icon : null}
              <span>{nav.label}</span>
              {nav.badge !== undefined && nav.badge > 0 && (
                <Badge className="bg-primary-color text-white rounded-full h-5 min-w-5 text-[10px] px-1.5 flex items-center justify-center">
                  {nav.badge}
                </Badge>
              )}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-sm text-red-500 px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-red-50 ml-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Mobile: Cart + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-warm-text" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-color text-white text-[10px] font-bold rounded-full h-4.5 min-w-4.5 flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-warm-text" />
            ) : (
              <Menu className="h-5 w-5 text-warm-text" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 md:hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Image src={logo} alt="FreshBites logo" width={28} height={28} />
                <span className="text-primary-color font-bold">FreshBites</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((nav) => (
                <Link
                  key={nav.link}
                  href={nav.link}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-warm-text transition-colors",
                    pathName === nav.link
                      ? "bg-primary-color text-white font-semibold"
                      : "hover:bg-gray-50"
                  )}
                >
                  {nav.icon}
                  <span>{nav.label}</span>
                  {nav.badge !== undefined && nav.badge > 0 && (
                    <Badge className="ml-auto bg-primary-color text-white rounded-full h-5 min-w-5 text-[10px] px-1.5">
                      {nav.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 transition-colors hover:bg-red-50 mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
