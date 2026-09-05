import VideoBackground from './components/VideoBackground'
import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import StatsBar        from './components/StatsBar'
import HomeContent     from './components/HomeContent'

export default function HomePage() {
  return (
    <>
      <VideoBackground />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HomeContent />
      </main>
    </>
  )
}
