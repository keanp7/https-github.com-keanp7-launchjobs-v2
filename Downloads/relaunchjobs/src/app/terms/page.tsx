import Link from "next/link"

export const metadata = { title: "Terms of Service — RelaunchJobs" }

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", padding: "60px 5%" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: "14px", color: "#1a3a6b", textDecoration: "none" }}>← Back to RelaunchJobs</Link>
          <Link href="/privacy" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/contact" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>Contact</Link>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#0f172a", marginBottom: "8px" }}>
          Terms of Service
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "40px" }}>
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using RelaunchJobs, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.",
          },
          {
            title: "2. Description of Service",
            body: "RelaunchJobs provides AI-powered career transition tools including skill extraction, role matching, gap analysis, and personalized learning plans. The service is provided for informational purposes and does not guarantee employment outcomes.",
          },
          {
            title: "3. User Accounts",
            body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as necessary. You must be at least 18 years old to use this service.",
          },
          {
            title: "4. Acceptable Use",
            body: "You agree not to misuse the service, attempt to access it through unauthorized means, or use it for any unlawful purpose. You may not resell, redistribute, or sublicense access to the service.",
          },
          {
            title: "5. Intellectual Property",
            body: "The RelaunchJobs platform, including its AI models, prompts, and interface, is owned by RelaunchJobs. Your career data belongs to you. We do not claim ownership over the content you provide.",
          },
          {
            title: "6. Disclaimers",
            body: "The service is provided 'as is' without warranties of any kind. Career analysis outputs are AI-generated and should be used as a guide, not professional career advice. Results may vary.",
          },
          {
            title: "7. Limitation of Liability",
            body: "RelaunchJobs shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the last 12 months.",
          },
          {
            title: "8. Changes to Terms",
            body: "We may update these terms from time to time. We will notify you of significant changes by email or by posting a notice on the platform. Continued use of the service constitutes acceptance of the updated terms.",
          },
          {
            title: "9. Contact",
            body: "For questions about these Terms, contact us at support@relaunchjobs.app.",
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a3a6b", marginBottom: "10px" }}>
              {section.title}
            </h2>
            <p style={{ fontSize: "15px", lineHeight: 1.75, color: "#4a5568" }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
