import VideoBackground from './components/VideoBackground'
import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import StatsBar        from './components/StatsBar'

export default function HomePage() {
  return (
    <>
      <VideoBackground />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
      </main>
    </>
  )
}
