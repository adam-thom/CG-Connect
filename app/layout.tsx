import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { RoutingProvider } from "@/lib/routing-context";
import { getSessionUser } from "@/lib/session";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <RoutingProvider>
            {children}
          </RoutingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
