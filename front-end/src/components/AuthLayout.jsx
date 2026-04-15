export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_rgba(219,234,254,0)_36%),radial-gradient(circle_at_bottom_right,_#e2e8f0_0%,_rgba(226,232,240,0)_34%),#f3f6fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.65)] backdrop-blur lg:grid-cols-2">
        <section 
          className="relative hidden bg-cover bg-center p-10 text-white lg:flex lg:flex-col lg:justify-between"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607687983-a4473b9e4aae?auto=format&fit=crop&q=80&w=1600")' }}
        >
          {/* Standard dark overlay for universal browser support */}
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/90 drop-shadow-md">BNB Platform</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white drop-shadow-lg">Discover premium stays.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 drop-shadow-md">
              Manage luxury apartments, reservations, and analytics through one modern control center.
            </p>
          </div>
          <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-slate-100 backdrop-blur-md">
            <p className="font-semibold text-white">Focus on hospitality</p>
            <p className="mt-1.5 leading-relaxed text-white/80">
              Your account is protected with state-of-the-art security, leaving you free to focus on your guests.
            </p>
          </div>
        </section>

        <section className="flex items-center p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <header className="mb-6 space-y-2 text-left">
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
