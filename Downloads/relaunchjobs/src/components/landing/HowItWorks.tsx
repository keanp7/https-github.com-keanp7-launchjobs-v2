const STEPS = [
  {
    number: "01",
    title: "Describe your background",
    body: "Paste your job title and a few sentences about what you've done. No resume upload needed.",
  },
  {
    number: "02",
    title: "We extract your real skills",
    body: "Our AI maps your experience to transferable skills — the ones that actually matter to employers.",
  },
  {
    number: "03",
    title: "See your market risk score",
    body: "Understand your automation risk, demand signals, and transferability — with clear, honest insights.",
  },
  {
    number: "04",
    title: "Pick your target role",
    body: "Choose from 3–5 adjacent roles or 2–3 bold pivots. We show you match scores for each.",
  },
  {
    number: "05",
    title: "Close the gap",
    body: "A personalized learning sprint — specific resources, week by week, hours per week.",
  },
  {
    number: "06",
    title: "Get your skills profile",
    body: "A LinkedIn-ready headline, summary, and ATS keywords — built for where you're going, not where you've been.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Six steps. One clear path.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="space-y-2">
              <span className="text-sm font-mono font-bold text-blue-600">{step.number}</span>
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
