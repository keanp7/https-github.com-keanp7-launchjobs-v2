import { Hero } from "@/components/landing/Hero"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { PainPoints } from "@/components/landing/PainPoints"
import { Testimonials } from "@/components/landing/Testimonials"
import { CTASection } from "@/components/landing/CTASection"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
