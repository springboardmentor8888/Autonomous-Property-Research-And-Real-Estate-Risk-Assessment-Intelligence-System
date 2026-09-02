import './globals.css'
import Navbar from './components/Navbar'
import HashRedirect from './components/HashRedirect'

export const metadata = {
  title: 'PropDue — Autonomous Property Risk Intelligence',
  description: 'Enterprise-grade AI engine for property due diligence, title audits, environmental risk scoring, and legal compliance verification.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <HashRedirect />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
