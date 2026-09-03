import type { Metadata } from "next";
import { Archivo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { getSessionUser } from "@/lib/session";

// Brand faces are licensed (Baskerville Pro / Forma DJR Display). The design
// system specifies these Google equivalents for screen. See
// CLAUDE-design-system.md -> Typography.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
});

// Headings only, and only at 400-500. Never bold.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  // Role-neutral: the sidebar names the portal per role (Staff /
  // Management / Admin), so the tab title should not claim one of them.
  title: "CG Connect",
  description: "Excellence in service, dignity in transition.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  // The font variables must sit on <html>, not <body>: globals.css declares
  // `--font-sans: var(--font-archivo)` at :root, and a custom property is
  // resolved on the element that declares it. Defined only on <body>, that
  // reference is invalid at :root and every font utility silently falls back
  // to the system stack.
  return (
    <html lang="en" className={`${archivo.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
