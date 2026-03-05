import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/faculties', label: 'Faculties', icon: '🏛' },
  { to: '/semesters', label: 'Semesters', icon: '📅' },
  { to: '/modules',   label: 'Modules',   icon: '📚' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30 flex flex-col">

      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
          A
        </div>
        <span className="font-bold text-gray-900 text-[15px] tracking-tight">LearnBuddy</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
          Manage
        </p>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 shrink-0">
        <p className="text-[10px] font-semibold text-gray-500 mb-1">Hierarchy</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Faculties → Semesters → Modules
        </p>
      </div>

    </aside>
  )
}
