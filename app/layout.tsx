import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={
  title:'Project 8 — AI Customer Support',
  description:'A multi-tenant support assistant with business-specific answers and a human inbox.',
  robots:{index:false,follow:false},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
