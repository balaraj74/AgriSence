import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import MobileShowcaseSection from '@/components/MobileShowcaseSection'
import PlatformOverviewSection from '@/components/PlatformOverviewSection'
import TechStackSection from '@/components/TechStackSection'
import DownloadSection from '@/components/DownloadSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="bg-[#010101] text-white min-h-screen overflow-x-hidden">
      {/* Hero is full viewport — Navbar overlays it */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Navbar />
      </div>

      <HeroSection />

      {/* Rest of the page below the fold */}
      <div className="relative z-10 bg-[#010101]">
        <FeaturesSection />
        <MobileShowcaseSection />
        <PlatformOverviewSection />
        <TechStackSection />
        <DownloadSection />
        <Footer />
      </div>
    </main>
  )
}
