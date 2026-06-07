import { Anton, Inter } from "next/font/google";

export const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});
