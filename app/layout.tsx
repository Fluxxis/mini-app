import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import TelegramWebAppFix from "@/components/telegram-webapp-fix"
import "./globals.css"

export const metadata: Metadata = {
  title: "Telegram Authentication",
  description: "Secure Telegram Mini App Authentication",
  generator: "v0.app",
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
	    <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
        <meta
          name="viewport"
	      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased">
        <TelegramWebAppFix />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
