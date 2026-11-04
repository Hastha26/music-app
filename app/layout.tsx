import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Cadence — Your daily soundtrack',description:'Find your rhythm. Discover original instrumental demos, build playlists, and make yourself at home.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
