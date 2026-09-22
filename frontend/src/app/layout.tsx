import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FreshBites — Fresh Food Delivered Hot",
    template: "%s | FreshBites",
  },
  description:
    "Discover top-rated local restaurants, gourmet street food, and farm-fresh organic bowls crafted by award-winning chefs. Order now for fast delivery.",
  keywords: ["food delivery", "order food", "restaurant", "fresh bites", "fast delivery"],
  openGraph: {
    title: "FreshBites — Fresh Food Delivered Hot",
    description:
      "Discover top-rated local restaurants, gourmet street food, and farm-fresh organic bowls. Order now!",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
