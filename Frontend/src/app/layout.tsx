import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RishStay",
  description: "Created by Shashank Daga",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="chakra-ui-light">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
