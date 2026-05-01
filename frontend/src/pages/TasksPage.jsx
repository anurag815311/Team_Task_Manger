import { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSearch, HiOutlineFilter, HiOutlinePencil } from 'react-icons/hi';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ project: '', status: '', priority: '' });
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'To Do', assignedTo: '', project: '' });
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projRes] = await Promise.all([tasksAPI.getAll(), projectsAPI.getAll()]);
      setTasks(tasksRes.data.data);
      setProjects(projRes.data.data);
    } catch (e) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.project) params.project = filters.project;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (search) params.search = search;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data);
    } catch (e) { toast.error('Failed to load tasks'); }
  };

  useEffect(() => { if (!loading) fetchTasks(); }, [filters, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await tasksAPI.create(payload);
      toast.success('Task created!');
      setShowCreate(false);
      resetForm();
      fetchTasks();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create task'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await tasksAPI.update(editTask._id, payload);
      toast.success('Task updated!');
      setEditTask(null);
      resetForm();
      fetchTasks();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksAPI.delete(id); toast.success('Task deleted'); fetchTasks(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const resetForm = () => setForm({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'To Do', assignedTo: '', project: '' });

  const openEdit = (t) => {
    setForm({
      title: t.title, description: t.description || '', dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      priority: t.priority, status: t.status, assignedTo: t.assignedTo?._id || '', project: t.project?._id || '',
    });
    setSelectedProject(projects.find(p => p._id === t.project?._id));
    setEditTask(t);
  };

  const openCreate = () => { resetForm(); setSelectedProject(null); setShowCreate(true); };

  const handleProjectSelect = (projectId) => {
    setForm({ ...form, project: projectId, assignedTo: '' });
    setSelectedProject(projects.find(p => p._id === projectId));
  };

  const isOverdue = (d) => d && new Date(d) < new Date() ;

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white mb-1">Tasks</h1><p className="text-surface-400">Manage and track all tasks</p></div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" />New Task</button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})} className="input-field w-auto min-w-[160px]">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="input-field w-auto min-w-[140px]">
            <option value="">All Status</option>
            <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
          </select>
          <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="input-field w-auto min-w-[140px]">
            <option value="">All Priority</option>
            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineFilter className="w-16 h-16 mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
          <p className="text-surface-400">Create tasks or adjust your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(t => {
            const proj = projects.find(p => p._id === (t.project?._id || t.project));
            const isAdmin = proj?.admin?._id === user?._id;
            return (
              <div key={t._id} className="glass-card p-5 hover:border-primary-500/20 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white">{t.title}</h3>
                      <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                      <span className={`badge ${t.status==='Done'?'badge-done':t.status==='In Progress'?'badge-progress':'badge-todo'}`}>{t.status}</span>
                      {isOverdue(t.dueDate) && t.status !== 'Done' && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">Overdue</span>}
                    </div>
                    {t.description && <p className="text-sm text-surface-400 mb-2 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
                      <span>📁 {t.project?.name || 'Unknown'}</span>
                      <span>👤 {t.assignedTo?.name || 'Unassigned'}</span>
                      {t.dueDate && <span>📅 {new Date(t.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick status change */}
                    <select value={t.status} onChange={e => handleStatusChange(t._id, e.target.value)}
                      className="text-xs bg-surface-800 border border-surface-700 rounded-lg px-2 py-1.5 text-surface-300 outline-none focus:border-primary-500 cursor-pointer">
                      <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
                    </select>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-primary-500/20 text-surface-400 hover:text-primary-400 transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showCreate || !!editTask} onClose={() => { setShowCreate(false); setEditTask(null); resetForm(); }} title={editTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={editTask ? handleUpdate : handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-2">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input-field" placeholder="Task title" /></div>
          <div><label className="block text-sm font-medium text-surface-300 mb-2">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Task description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Project</label>
              <select value={form.project} onChange={e => handleProjectSelect(e.target.value)} required className="input-field">
                <option value="">Select Project</option>
                {projects.filter(p => p.admin?._id === user?._id).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="input-field">
                <option value="">Unassigned</option>
                {selectedProject?.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" /></div>
          </div>
          <button type="submit" className="btn-primary w-full">{editTask ? 'Update Task' : 'Create Task'}</button>
        </form>
      </Modal>
    </div>
  );
};
export default TasksPage;
