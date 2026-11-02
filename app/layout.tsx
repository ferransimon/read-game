import type { Metadata, Viewport } from "next";
import { Andika, Playpen_Sans } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const school = Playpen_Sans({
  variable: "--font-school",
  subsets: ["latin", "latin-ext"],
});

const reading = Andika({
  variable: "--font-reading",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Llegim!",
  description: "Juegos de lectura y ortografía para primaria · Jocs de lectura i ortografia",
  appleWebApp: { capable: true, title: "Llegim!", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#FFE8D6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${school.variable} ${reading.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
