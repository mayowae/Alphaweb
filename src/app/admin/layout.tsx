import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Lato  } from "next/font/google";
import "./global2.css";
import ReactQueryProvider from "../../../libs/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic",],
  preload: true,
  display: "swap",
  variable: "--font-inter"
});


const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic",],
  preload: true,
  display: "swap",
  variable: "--font-lato"
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  preload: true,
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "AlphaWeb Supa-Admin",
  keywords: ["finance", "app", "nextjs", "react"],
  description: "A modern web finance application",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={` antialiased  dark:bg-gray-900 dark:text-white transition-colors duration-500`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>   
      </body>
    </html>
  );
}
