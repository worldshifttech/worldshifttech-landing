import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "World Shift Technologies — Responsible AI & Systems Solutions",
  description:
    "I audit how SMBs use AI and design lean AI solutions and systems, putting people before technology. A portion of every project goes into verified environmental programs.",
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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F4F2EE] text-[#00205C]">
        {children}
      </body>
    </html>
  );
}
