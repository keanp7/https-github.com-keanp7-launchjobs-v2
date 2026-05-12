const TESTIMONIALS = [
  {
    quote:
      "I'd been a nurse for 12 years and had no idea how to explain my skills to a tech company. RelaunchJobs gave me language I didn't know I had.",
    name: "Danielle R.",
    role: "Nurse → UX Researcher",
  },
  {
    quote:
      "The risk score alone was worth it. Seeing my role was in the high-automation zone made the decision to pivot feel urgent, not optional.",
    name: "Marcus T.",
    role: "Financial Analyst → Product Manager",
  },
  {
    quote:
      "I got the learning sprint on a Friday. By the following Monday I had a study plan, a new headline, and my first outreach message drafted.",
    name: "Sofia L.",
    role: "Teacher → Customer Success",
  },
]

export function Testimonials() {
  return (
    <section className="bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Real pivots. Real results.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-blue-600">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
