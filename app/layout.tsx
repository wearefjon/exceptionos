import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'ExceptionOS', description:'Voice-native exception management for real-world operations' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
