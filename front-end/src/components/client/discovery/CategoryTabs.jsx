export default function CategoryTabs({ value, onChange, items }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = value === item.value

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.icon && (
              <span className={`text-base leading-none ${active ? 'opacity-100' : 'opacity-60'}`}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
