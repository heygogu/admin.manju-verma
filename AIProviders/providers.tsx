import { DeepgramContextProvider } from "@/app/contexts/DeepgramContextProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MicrophoneContextProvider } from "@/app/contexts/MicrophoneContextProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={inter.className + " overflow-hidden"}
      >
        <DeepgramContextProvider>
          <MicrophoneContextProvider>{children}</MicrophoneContextProvider>
        </DeepgramContextProvider>
     
      </body>
    </html>
  );
}