import './globals.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'PropDue — Autonomous Property Risk Intelligence',
  description: 'Enterprise-grade AI engine for property due diligence, title audits, environmental risk scoring, and legal compliance verification.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
