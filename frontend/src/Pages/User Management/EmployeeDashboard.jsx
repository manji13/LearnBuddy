import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

import Navbar from '../../Components/NavBar/NavBar.jsx'; 
import Sidebar from '../../Components/ModuleManagement/Sidebar.jsx';
import EmployeeNavbar from '../../Components/NavBar/employeeNavbar.jsx'; 

const CAMPUS_COLORS  = ['#6366f1','#818cf8','#4f46e5','#a5b4fc','#7c3aed','#c4b5fd'];
const FACULTY_COLORS = ['#0891b2','#06b6d4','#0e7490','#22d3ee','#0284c7','#38bdf8','#0369a1','#7dd3fc'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', fontFamily: 'inherit' }}>
      {label && <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 14, color: p.color, fontWeight: 700 }}>{p.name}: <span style={{ color: '#1e293b' }}>{p.value?.toLocaleString()}</span></p>
      ))}
    </div>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', ...style }}>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, accent, sub }) => (
  <Card style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: accent, opacity: 0.10, filter: 'blur(24px)' }} />
    <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>
      {value === null
        ? <div style={{ width: 70, height: 28, borderRadius: 6, background: '#f1f5f9' }} />
        : value?.toLocaleString()}
    </div>
    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    {sub && <div style={{ marginTop: 3, fontSize: 12, color: accent, fontWeight: 600 }}>{sub}</div>}
  </Card>
);

const ChartCard = ({ title, subtitle, children }) => (
  <Card>
    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>{subtitle}</p>}
    {!subtitle && <div style={{ marginBottom: 20 }} />}
    {children}
  </Card>
);

const Skeleton = ({ h = 240 }) => (
  <div style={{ height: h, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
    {[55,80,45,90,65,75,50,85].map((v, i) => (
      <div key={i} style={{ flex: 1, height: `${v}%`, borderRadius: '6px 6px 0 0', background: '#f1f5f9' }} />
    ))}
  </div>
);

const TableRow = ({ rank, name, count, total, color }) => {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <tr style={{ borderBottom: '1px solid #f8fafc' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td style={{ padding: '11px 14px', fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>#{rank}</td>
      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{name}</td>
      <td style={{ padding: '11px 14px', fontSize: 15, fontWeight: 800, color }}>{count?.toLocaleString()}</td>
      <td style={{ padding: '11px 14px', minWidth: 150 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#f1f5f9' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color }} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 34 }}>{pct}%</span>
        </div>
      </td>
    </tr>
  );
};

export default function EmployeePage() {
  const [campusData,  setCampusData]  = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [tab,         setTab]         = useState('overview');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:5000/api/auth/analytics');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setCampusData(data.campusData   || data.campus  || []);
      setFacultyData(data.facultyData || data.faculty || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const totalC = campusData.reduce((s, d)  => s + (d.count || 0), 0);
  const totalF = facultyData.reduce((s, d) => s + (d.count || 0), 0);
  const topC   = [...campusData].sort((a, b)  => b.count - a.count)[0];
  const topF   = [...facultyData].sort((a, b) => b.count - a.count)[0];
  const sortC  = [...campusData].sort((a, b)  => b.count - a.count);
  const sortF  = [...facultyData].sort((a, b) => b.count - a.count);

  const TABS = ['overview','campus','faculty'];

  if (loading && !campusData.length) return (
    <>
      <EmployeeNavbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#6366f1', fontWeight: 700 }}>Loading analytics…</p>
        </div>
      </div>
    </>
  );

  if (error && !campusData.length) return (
    <>
      <EmployeeNavbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 48px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
          <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Failed to load</p>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>{error}</p>
          <button onClick={fetchData} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Retry</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <EmployeeNavbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f1f5f9', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1e293b' }}>
        <style>{`* { box-sizing: border-box; } @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* subtle top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Employee Dashboard</p>
              <h1 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                Student Registration Analytics
              </h1>
            </div>
            <button onClick={fetchData} disabled={loading} style={{
              background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10,
              padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 12px rgba(99,102,241,0.30)',
            }}>
              <span style={{ display: 'inline-block', animation: loading ? 'spin 0.8s linear infinite' : 'none' }}>↻</span>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon="🎓" label="Total Students (Campus)"  value={loading ? null : totalC} accent="#6366f1" sub={topC ? `Top: ${topC.name}` : ''} />
            <StatCard icon="📚" label="Total Students (Faculty)" value={loading ? null : totalF} accent="#0891b2" sub={topF ? `Top: ${topF.name}` : ''} />
            <StatCard icon="🏛️" label="Campuses"                 value={loading ? null : campusData.length}  accent="#f59e0b" sub="Active campuses" />
            <StatCard icon="🏫" label="Faculties"                value={loading ? null : facultyData.length} accent="#10b981" sub="Enrolled faculties" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600,
                fontSize: 13, textTransform: 'capitalize', transition: 'all 0.15s', fontFamily: 'inherit',
                background: tab === t ? '#6366f1' : '#fff',
                color:      tab === t ? '#fff'    : '#64748b',
                boxShadow:  tab === t ? '0 2px 12px rgba(99,102,241,0.30)' : '0 1px 3px rgba(0,0,0,0.06)',
              }}>{t}</button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
                <ChartCard title="Students per Campus" subtitle="Registered students at each campus">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortC} barSize={34} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} />
                          <Bar dataKey="count" name="Students" radius={[6,6,0,0]}>
                            {sortC.map((_, i) => <Cell key={i} fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
                <ChartCard title="Faculty Distribution" subtitle="Share of students by faculty">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={facultyData} dataKey="count" nameKey="name" cx="50%" cy="44%" innerRadius={52} outerRadius={80} paddingAngle={3}>
                            {facultyData.map((_, i) => <Cell key={i} fill={FACULTY_COLORS[i % FACULTY_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<Tip />} />
                          <Legend formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
              </div>

              <ChartCard title="Students per Faculty" subtitle="Ranked enrollment count by academic faculty">
                {loading ? <Skeleton /> : (
                  <div style={{ height: Math.max(200, facultyData.length * 46) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortF} layout="vertical" barSize={22} margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<Tip />} />
                        <Bar dataKey="count" name="Students" radius={[0,6,6,0]}>
                          {sortF.map((_, i) => <Cell key={i} fill={FACULTY_COLORS[i % FACULTY_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>
            </div>
          )}

          {/* ── CAMPUS ── */}
          {tab === 'campus' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ChartCard title="Campus Bar Chart" subtitle="Students per campus (highest to lowest)">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortC} barSize={40} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} />
                          <Bar dataKey="count" name="Students" radius={[7,7,0,0]}>
                            {sortC.map((_, i) => <Cell key={i} fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
                <ChartCard title="Campus Pie Chart" subtitle="Proportional student share per campus">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={campusData} dataKey="count" nameKey="name" cx="50%" cy="44%" outerRadius={95} paddingAngle={3}>
                            {campusData.map((_, i) => <Cell key={i} fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<Tip />} />
                          <Legend formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} wrapperStyle={{ paddingTop: 10 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
              </div>
              <ChartCard title="Campus Detail Table" subtitle="Exact count and share per campus">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Rank','Campus','Students','Share'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 14px', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.09em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortC.map((row, i) => <TableRow key={row.name} rank={i+1} name={row.name} count={row.count} total={totalC} color={CAMPUS_COLORS[i % CAMPUS_COLORS.length]} />)}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #f1f5f9' }}>
                      <td colSpan={2} style={{ padding:'11px 14px', fontWeight:700, color:'#0f172a' }}>Total</td>
                      <td style={{ padding:'11px 14px', fontWeight:800, color:'#6366f1', fontSize:16 }}>{totalC.toLocaleString()}</td>
                      <td style={{ padding:'11px 14px', color:'#94a3b8', fontSize:13 }}>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </ChartCard>
            </div>
          )}

          {/* ── FACULTY ── */}
          {tab === 'faculty' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ChartCard title="Faculty Horizontal Bar" subtitle="Students enrolled per faculty (ranked)">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: Math.max(260, facultyData.length * 50) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortF} layout="vertical" barSize={22} margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
                          <Tooltip content={<Tip />} />
                          <Bar dataKey="count" name="Students" radius={[0,6,6,0]}>
                            {sortF.map((_, i) => <Cell key={i} fill={FACULTY_COLORS[i % FACULTY_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
                <ChartCard title="Faculty Area Chart" subtitle="Enrollment curve across faculties">
                  {loading ? <Skeleton /> : (
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={facultyData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                          <defs>
                            <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.18} />
                              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<Tip />} />
                          <Area type="monotone" dataKey="count" stroke="#0891b2" strokeWidth={2.5} fill="url(#fg)" name="Students"
                            dot={{ r: 5, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </ChartCard>
              </div>
              <ChartCard title="Faculty Detail Table" subtitle="Exact student count and share per faculty">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Rank','Faculty','Students','Share'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 14px', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.09em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortF.map((row, i) => <TableRow key={row.name} rank={i+1} name={row.name} count={row.count} total={totalF} color={FACULTY_COLORS[i % FACULTY_COLORS.length]} />)}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #f1f5f9' }}>
                      <td colSpan={2} style={{ padding:'11px 14px', fontWeight:700, color:'#0f172a' }}>Total</td>
                      <td style={{ padding:'11px 14px', fontWeight:800, color:'#0891b2', fontSize:16 }}>{totalF.toLocaleString()}</td>
                      <td style={{ padding:'11px 14px', color:'#94a3b8', fontSize:13 }}>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </ChartCard>
            </div>
          )}

        </div>
      </div>
    </>
  );
}