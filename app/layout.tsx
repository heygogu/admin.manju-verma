import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import AIProvider from "@/AIProviders/providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Portfolio Admin",
  description: "Admin dashboard for managing content and clients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="blue" height={1.5} zIndex={1600} />
          <NuqsAdapter>
           
            <AIProvider>{children}</AIProvider>
          </NuqsAdapter>
          <Toaster position="top-right" />
        </NextThemesProvider>
      </body>
    </html>
  );
}
