import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";

export const metadata: Metadata = {
  title: "Expense Diary — Track every rupee. Understand every expense.",
  description:
    "A personal daily expense diary and finance dashboard. Log every expense, understand your spending, and stay on budget.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Diary",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
