'use client';

import './globals.css';
import { Inter } from "next/font/google";
import { CartDrawer } from '@/components/cart-drawer';
import { CartProvider } from "@/contexts/cart-context";
import { Navbar } from '@/components/core/navbar';
import QueryProvider from '@/providers/query-provider';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <CartProvider>
            <Navbar />
            {children}
            <CartDrawer />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
