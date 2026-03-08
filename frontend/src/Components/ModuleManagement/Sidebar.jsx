import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/faculties', label: 'Faculties', icon: '🏛' },
  { to: '/semesters', label: 'Semesters', icon: '📅' },
  { to: '/modules',   label: 'Modules',   icon: '📚' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30 flex flex-col">

      <nav className="flex-1 px-3 pt-20 pb-4 space-y-0.5 overflow-y-auto">

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

    </aside>
  )
}