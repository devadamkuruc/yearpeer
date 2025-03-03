import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import {SessionProvider} from "next-auth/react";

export const metadata: Metadata = {
    title: "YearPeer - Plan your year",
    description: "A visual life planning tool to help you achieve your goals",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body>
        <SessionProvider>
            {children}
        </SessionProvider>
        </body>
        </html>
    );
}