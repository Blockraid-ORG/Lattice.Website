import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from 'nextjs-toploader';
import { cookieToWeb3AuthState } from "@web3auth/modal";
import { headers } from "next/headers";
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Terravest",
  description: "Terravest is a blockchain-based investment platform focused on Real World Assets (RWA), enabling anyone to invest securely, transparently, and with full decentralization. We tokenize real-world assets such as property, gold, and other commodities into digital tokens that are accessible and tradable worldwide. Gain access to global investment opportunities with competitive returns through Terravest's trusted ecosystem.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const headersList = await headers();
  const web3authInitialState = cookieToWeb3AuthState(headersList.get('cookie'));
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.className} antialiased`}
      >
        <NextTopLoader color="#20C997" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider web3authInitialState={web3authInitialState}>
            {children}
          </ReactQueryProvider>

          <Toaster
            expand={true}
            closeButton
            gap={4}
            richColors
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
