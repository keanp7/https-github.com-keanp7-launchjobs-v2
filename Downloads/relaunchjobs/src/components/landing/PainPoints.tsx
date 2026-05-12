const PAINS = [
  {
    icon: "😰",
    title: "\"I don't know what I'm worth anymore\"",
    body: "Years of experience, but no idea how to frame it for a new industry.",
  },
  {
    icon: "📋",
    title: "\"I get ghosted after every application\"",
    body: "Your resume looks like everyone else's because no one's helped you stand out.",
  },
  {
    icon: "😵",
    title: "\"I don't know where to even start\"",
    body: "Google says pivot to tech. LinkedIn says go into sales. Everyone disagrees.",
  },
]

export function PainPoints() {
  return (
    <section className="bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sound familiar?
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PAINS.map((p) => (
            <div key={p.title} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="text-3xl">{p.icon}</div>
              <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
