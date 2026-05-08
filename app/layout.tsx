import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "World Shift Technologies — AI Audit and Precision Builds for SMBs",
  description:
    "I audit how SMBs use AI, design the leanest version that works, and build what needs to be built. A portion of every project goes into verified environmental programs.",
  icons: {
    icon: "/wst-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080C14] text-[#F4F2EE]">
        {children}
      </body>
    </html>
  );
}
