import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { HiOutlineClipboardList, HiOutlineFolder, HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = { 'To Do': '#3b82f6', 'In Progress': '#f59e0b', Done: '#10b981' };
const PRIORITY_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { dashboardAPI.getStats().then(r => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!stats) return <div className="text-center py-20"><p className="text-surface-400 text-lg">No data yet. Create a project to get started!</p></div>;

  const statusData = Object.entries(stats.tasksByStatus).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats.tasksByPriority).map(([name, value]) => ({ name, value }));
  const cards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: HiOutlineClipboardList, bg: 'bg-primary-500/10' },
    { title: 'Projects', value: stats.totalProjects, icon: HiOutlineFolder, bg: 'bg-accent-500/10' },
    { title: 'In Progress', value: stats.tasksByStatus['In Progress'] || 0, icon: HiOutlineClock, bg: 'bg-warning/10' },
    { title: 'Overdue', value: stats.overdueTasks, icon: HiOutlineExclamation, bg: 'bg-danger/10' },
  ];
  const ttStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1><p className="text-surface-400">Overview of your team's progress</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => { const Icon = c.icon; return (
          <div key={i} className="glass-card p-5 hover:border-primary-500/30 transition-all duration-300">
            <div className={`p-2.5 rounded-xl ${c.bg} inline-block mb-3`}><Icon className="w-5 h-5 text-white" /></div>
            <p className="text-3xl font-bold text-white mb-1">{c.value}</p>
            <p className="text-sm text-surface-400">{c.title}</p>
          </div>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Status</h3>
          {stats.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {statusData.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name]} />)}
              </Pie><Tooltip contentStyle={ttStyle} /><Legend wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} /></PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-64 text-surface-500">No tasks yet</div>}
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Priority</h3>
          {stats.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={13} /><YAxis stroke="#94a3b8" fontSize={13} allowDecimals={false} /><Tooltip contentStyle={ttStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>{priorityData.map((e, i) => <Cell key={i} fill={PRIORITY_COLORS[e.name]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-64 text-surface-500">No tasks yet</div>}
        </div>
      </div>

      {stats.tasksPerUser.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-surface-700/50">
            {['Member','Total','To Do','In Progress','Done','Progress'].map(h => <th key={h} className={`${h==='Member'?'text-left':'text-center'} py-3 px-4 text-sm font-medium text-surface-400`}>{h}</th>)}
          </tr></thead><tbody>
            {stats.tasksPerUser.map((m, i) => { const p = m.total > 0 ? Math.round((m.done/m.total)*100) : 0; return (
              <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
                <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xs font-bold text-white">{m.name.charAt(0).toUpperCase()}</div><div><p className="text-sm font-medium text-white">{m.name}</p><p className="text-xs text-surface-500">{m.email}</p></div></div></td>
                <td className="text-center py-3 px-4 text-sm text-white font-semibold">{m.total}</td>
                <td className="text-center py-3 px-4"><span className="badge badge-todo">{m.toDo}</span></td>
                <td className="text-center py-3 px-4"><span className="badge badge-progress">{m.inProgress}</span></td>
                <td className="text-center py-3 px-4"><span className="badge badge-done">{m.done}</span></td>
                <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-success rounded-full transition-all duration-500" style={{width:`${p}%`}} /></div><span className="text-xs text-surface-400 w-10 text-right">{p}%</span></div></td>
              </tr>
            ); })}
          </tbody></table></div>
        </div>
      )}

      {stats.recentTasks.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
          <div className="space-y-3">{stats.recentTasks.map(t => (
            <div key={t._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 transition-colors">
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{t.title}</p><p className="text-xs text-surface-500 mt-1">{t.project?.name} • {t.assignedTo?.name || 'Unassigned'}</p></div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                <span className={`badge ${t.status==='Done'?'badge-done':t.status==='In Progress'?'badge-progress':'badge-todo'}`}>{t.status}</span>
              </div>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;
