import type { Metadata, Viewport } from "next";
import { Poppins, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Global Axis Concepts — Smart booking software to grow your business",
    template: "%s · Global Axis Concepts",
  },
  description:
    "Global Axis Concepts is a complete SaaS multi-business service booking platform. Get a branded booking site, accept appointments and payments, and manage staff, services, and customers.",
  metadataBase: new URL("https://globalaxisconcepts.com"),
};

export const viewport: Viewport = {
  themeColor: "#286efb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-surface text-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
