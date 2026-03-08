import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar,
  LineChart, Line,
  AreaChart, Area,
} from 'recharts'


const COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899','#06b6d4','#84cc16']

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: <span className="text-gray-900">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ icon, label, value, sub, color = 'blue', to }) => {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    amber:  'bg-amber-50 text-amber-600',
    green:  'bg-emerald-50 text-emerald-600',
  }[color]
  const inner = (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${ring}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{children}</h2>
)

export default function Dashboard() {
  const [faculties, setFaculties] = useState([])
  const [semesters, setSemesters] = useState([])
  const [modules,   setModules]   = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/faculties'),
      axios.get('http://localhost:5000/api/semesters'),
      axios.get('http://localhost:5000/api/modules'),
    ])
      .then(([{ data: fd }, { data: sd }, { data: md }]) => {
        setFaculties(fd.data ?? fd)
        setSemesters(sd.data ?? sd)
        setModules(md.data ?? md)
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex">
  
      <div className="ml-56 flex-1 flex items-center justify-center gap-3 text-sm text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Loading dashboard...
      </div>
    </div>
  )

  // ── derived data ─────────────────────────────────────────────────────────────

  // Modules + semesters per faculty
  const modulesPerFaculty = faculties.map((f, i) => ({
    name:      f.code,
    fullName:  f.name,
    fid:       f._id,
    modules:   modules.filter(m  => (m.faculty?._id  || m.faculty)  === f._id).length,
    semesters: semesters.filter(s => (s.faculty?._id || s.faculty) === f._id).length,
    fill:      COLORS[i % COLORS.length],
  })).sort((a, b) => b.modules - a.modules)

  // Semesters per faculty (pie)
  const semestersPerFaculty = faculties.map((f, i) => ({
    name:  f.code,
    value: semesters.filter(s => (s.faculty?._id || s.faculty) === f._id).length,
    fill:  COLORS[i % COLORS.length],
  }))

  // Modules by academic year
  const modulesByYear = [1, 2, 3, 4].map(y => {
    const semIds = semesters.filter(s => s.year === y).map(s => s._id)
    return {
      name:    `Year ${y}`,
      modules: modules.filter(m => semIds.includes(m.semester?._id || m.semester)).length,
    }
  })

  // Top 10 semesters by module count (horizontal bar)
  const modulesBySemester = semesters
    .map(s => ({
      name:    `Y${s.year}S${s.semester} (${s.faculty?.code})`,
      modules: modules.filter(m => (m.semester?._id || m.semester) === s._id).length,
    }))
    .sort((a, b) => b.modules - a.modules)
    .slice(0, 10)

  // Semester coverage
  const semsWithModules = semesters.filter(s =>
    modules.some(m => (m.semester?._id || m.semester) === s._id)
  ).length
  const coveragePct = semesters.length
    ? Math.round((semsWithModules / semesters.length) * 100)
    : 0
  const radialData = [{ name: 'Coverage', value: coveragePct, fill: '#3b82f6' }]

  // Cumulative module growth across faculties (sorted by creation date)
  let cum = 0
  const growthData = [...faculties]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(f => {
      cum += modules.filter(m => (m.faculty?._id || m.faculty) === f._id).length
      return { name: f.code, total: cum }
    })

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
    
      <div className="flex">
    
        <main className="ml-56 flex-1 p-8 space-y-10">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Overview</p>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Academic structure at a glance</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🏛"  label="Faculties"      value={faculties.length}  color="blue"   to="/faculties" />
            <StatCard icon="📅"  label="Semesters"      value={semesters.length}  color="violet" to="/semesters" />
            <StatCard icon="📚"  label="Modules"        value={modules.length}    color="amber"  to="/modules"   />
            <StatCard
              icon="✅"
              label="Sem Coverage"
              value={`${coveragePct}%`}
              sub={`${semsWithModules} / ${semesters.length} semesters have modules`}
              color="green"
            />
          </div>

          {/* Row 1: bar + pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <SectionTitle>Modules per Faculty</SectionTitle>
              {modulesPerFaculty.every(d => d.modules === 0) ? (
                <p className="text-sm text-gray-400 py-10 text-center">No modules yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={modulesPerFaculty} barSize={32} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="modules" name="Modules" radius={[6, 6, 0, 0]}>
                      {modulesPerFaculty.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <SectionTitle>Semesters per Faculty</SectionTitle>
              {semestersPerFaculty.every(d => d.value === 0) ? (
                <p className="text-sm text-gray-400 py-10 text-center">No semesters yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={semestersPerFaculty}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={90} innerRadius={45}
                      paddingAngle={3}
                    >
                      {semestersPerFaculty.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row 2: area + horizontal bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <SectionTitle>Modules by Academic Year</SectionTitle>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={modulesByYear} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="modules" name="Modules" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#blueGrad)" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <SectionTitle>Top Semesters by Module Count</SectionTitle>
              {modulesBySemester.every(d => d.modules === 0) ? (
                <p className="text-sm text-gray-400 py-10 text-center">No modules yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart layout="vertical" data={modulesBySemester} barSize={14}
                    margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={95} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="modules" name="Modules" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row 3: line growth + radial coverage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
              <SectionTitle>Cumulative Module Growth (by Faculty)</SectionTitle>
              {growthData.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Line type="monotone" dataKey="total" name="Total Modules" stroke="#10b981"
                      strokeWidth={2.5} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
              <SectionTitle>Semester Coverage</SectionTitle>
              <ResponsiveContainer width="100%" height={170}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                  barSize={16} data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                  <Tooltip content={({ active, payload }) =>
                    active && payload?.length
                      ? <div className="bg-white border border-gray-200 rounded-xl shadow px-3 py-2 text-sm font-bold text-blue-600">{payload[0].value}% covered</div>
                      : null
                  } />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-4xl font-black text-blue-600 -mt-4">{coveragePct}%</p>
              <p className="text-xs text-gray-400 mt-1 text-center">
                {semsWithModules} of {semesters.length} semesters<br />have at least one module
              </p>
            </div>
          </div>

          {/* Faculty summary table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <SectionTitle>Faculty Summary</SectionTitle>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Faculty', 'Code', 'Semesters', 'Modules', 'Avg Modules / Sem', 'Share'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faculties.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No faculties yet</td></tr>
                ) : modulesPerFaculty.map((row, i) => {
                  const avg  = row.semesters ? (row.modules / row.semesters).toFixed(1) : '—'
                  const barW = modulesPerFaculty[0].modules
                    ? Math.round((row.modules / modulesPerFaculty[0].modules) * 100)
                    : 0
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/faculties/${row.fid}`} className="font-semibold text-gray-800 hover:text-blue-600 text-sm transition-colors">
                          {row.fullName}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">{row.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{row.semesters}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{row.modules}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{avg}</td>
                      <td className="px-5 py-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${barW}%`, backgroundColor: row.fill }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{barW}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}
