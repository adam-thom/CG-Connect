import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { RoutingProvider } from "@/lib/routing-context";
import { getSessionUser } from "@/lib/session";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "CG Connect - Stewardship Portal",
  description: "Excellence in service, dignity in transition.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`} suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <RoutingProvider>
            {children}
          </RoutingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
