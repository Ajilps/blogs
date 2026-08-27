import type { Metadata, Viewport } from "next";
import { GoToTop } from "@/components/go-to-top";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ajil's Notes — Essays, tutorials, and field notes",
    template: "%s — Ajil's Notes",
  },
  description:
    "Thoughtful notes on software, design, and the useful ideas found between them.",
  authors: [{ name: "Ajil", url: "https://ajil.cc/" }],
  openGraph: {
    title: "Ajil's Notes",
    description: "Writing for people who like to look closer.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Ajil's Notes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajil's Notes",
    description: "Writing for people who like to look closer.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#121512",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("ajil-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()',
          }}
        />
      </head>
      <body className="min-h-full">
        {children}
        <GoToTop />
      </body>
    </html>
  );
}
