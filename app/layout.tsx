import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConditionalChatbot } from "@/components/chat/ConditionalChatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NMU IntelliLearn",
  description:
    "Advanced AI-Powered Learning, Examination & Digital Certification System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <ConditionalChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}

