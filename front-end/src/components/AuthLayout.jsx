export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.18)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-white p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.8)_0%,_rgba(219,234,254,0)_38%),radial-gradient(circle_at_bottom_right,_rgba(226,232,240,0.8)_0%,_rgba(226,232,240,0)_34%)]" />

          <div className="absolute inset-y-0 right-0 w-px bg-slate-200/80" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="rounded-[2rem] border border-slate-200 bg-white px-10 py-9 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)]">
              <img src="/logo.svg" alt="rbnb logo" className="mx-auto h-28 w-28 drop-shadow-sm" />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.28em] text-slate-500">rbnb</p>
              <p className="mt-1 text-xs text-slate-500">Moroccan stays, simplified</p>
            </div>

            <h2 className="mt-8 text-4xl font-semibold tracking-tight text-slate-900">Discover premium stays.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Manage luxury apartments, reservations, and analytics through one modern control center.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-600 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.22)] backdrop-blur">
            <p className="font-semibold text-slate-900">Focus on hospitality</p>
            <p className="mt-1.5 leading-relaxed">
              Your account is protected with state-of-the-art security, leaving you free to focus on your guests.
            </p>
          </div>
        </section>

        <section className="flex items-center p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <header className="mb-6 space-y-2 text-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)]">
                <img src="/logo.svg" alt="rbnb logo" className="h-8 w-8" />
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500">rbnb</p>
                  <p className="text-sm font-semibold text-slate-900">Luxury rentals</p>
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Authentication</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
            </header>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
