import "./globals.css";
import type { Metadata } from "next";
import FabCreate from "./FabCreate";

export const metadata: Metadata = {
  title: "Car Ad — Minimal",
  description: "One VIN → one shareable car ad link.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
          <div className="small" style={{marginTop: 24}}>Minimal UI: gray background, blue links.</div>
        </div>
        <FabCreate />
      </body>
    </html>
  );
}
