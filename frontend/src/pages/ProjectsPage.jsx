import { useState, useEffect } from 'react';
import { projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineUsers } from 'react-icons/hi';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { const { data } = await projectsAPI.getAll(); setProjects(data.data); }
    catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create project'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectsAPI.delete(id); toast.success('Project deleted'); fetchProjects(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.addMember(showAddMember, memberEmail);
      toast.success('Member added!');
      setShowAddMember(null);
      setMemberEmail('');
      fetchProjects();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (projectId, userId, name) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    try { await projectsAPI.removeMember(projectId, userId); toast.success('Member removed'); fetchProjects(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to remove member'); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white mb-1">Projects</h1><p className="text-surface-400">Manage your team projects</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" />New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineUsers className="w-16 h-16 mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-surface-400 mb-6">Create your first project to start managing tasks</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isAdmin = p.admin?._id === user?._id;
            return (
              <div key={p._id} className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{p.name}</h3>
                    <p className="text-sm text-surface-400 mt-1 line-clamp-2">{p.description || 'No description'}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setShowAddMember(p._id)} className="p-2 rounded-lg hover:bg-primary-500/20 text-surface-400 hover:text-primary-400 transition-colors" title="Add member"><HiOutlineUserAdd className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-surface-500">Admin:</span>
                  <span className="text-xs font-medium text-primary-400">{p.admin?.name}</span>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-2">Members ({p.members?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {p.members?.map((m) => (
                      <div key={m._id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800/50 group/member">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[10px] font-bold text-white">{m.name.charAt(0).toUpperCase()}</div>
                        <span className="text-xs text-surface-300">{m.name}</span>
                        {isAdmin && m._id !== p.admin?._id && (
                          <button onClick={() => handleRemoveMember(p._id, m._id, m.name)} className="opacity-0 group-hover/member:opacity-100 text-red-400 hover:text-red-300 transition-opacity"><HiOutlineUserRemove className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-700/50 text-xs text-surface-500">
                  Created {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-2">Project Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-field" placeholder="My Awesome Project" /></div>
          <div><label className="block text-sm font-medium text-surface-300 mb-2">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="What is this project about?" /></div>
          <button type="submit" className="btn-primary w-full">Create Project</button>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={!!showAddMember} onClose={() => { setShowAddMember(null); setMemberEmail(''); }} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-2">Member Email</label><input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required className="input-field" placeholder="member@example.com" /></div>
          <button type="submit" className="btn-primary w-full">Add Member</button>
        </form>
      </Modal>
    </div>
  );
};
export default ProjectsPage;
