import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import Container from "./Container";
import { Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/all-foods" },
  { label: "Cart", href: "/cart" },
  { label: "About Us", href: "#" },
];

const categories = [
  { label: "Burgers", href: "/all-foods?category=Burgers" },
  { label: "Pizza", href: "/all-foods?category=Pizza" },
  { label: "Asian", href: "/all-foods?category=Asian" },
  { label: "Salads", href: "/all-foods?category=Salads" },
  { label: "Desserts", href: "/all-foods?category=Desserts" },
  { label: "Drinks", href: "/all-foods?category=Drinks" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="FreshBites logo" width={32} height={32} />
              <span className="text-xl font-bold text-white">FreshBites</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Discover top-rated local restaurants, gourmet street food, and farm-fresh
              organic bowls crafted by award-winning chefs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary-color" />
                <span>Rangunia, Chittagong</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-primary-color" />
                <span>01845299407</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-primary-color" />
                <span>hello@freshbites.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FreshBites. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
