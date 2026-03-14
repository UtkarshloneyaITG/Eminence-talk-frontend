import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, ArrowLeft, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap, pageEnter } from '@/animations/gsapConfig';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import UserAvatar from '@/components/ui/UserAvatar';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const containerRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => { pageEnter(containerRef.current); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/api/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    try {
      const { data } = await api.patch('/api/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setAvatarUploading(false); }
  };

  const statusOptions = ['online', 'away', 'busy', 'offline'];

  return (
    <div ref={containerRef} className="min-h-screen bg-space-950 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden shadow-glass"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-cyan-600/20 relative">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar section */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <label className="relative cursor-pointer group">
                <div className={`w-20 h-20 rounded-2xl border-4 border-space-950 overflow-hidden ${avatarUploading ? 'opacity-50' : ''}`}>
                  <UserAvatar user={user} size="xl" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                {avatarUploading && <span className="absolute inset-0 flex items-center justify-center"><span className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /></span>}
              </label>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
              >
                {editing ? <><Save size={14} />{saving ? 'Saving...' : 'Save'}</> : <><Edit3 size={14} />Edit</>}
              </motion.button>
            </div>

            {/* Username */}
            {editing ? (
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-white font-display font-bold text-xl w-full focus:outline-none focus:border-violet-500/50 mb-2 transition-all"
              />
            ) : (
              <h2 className="text-white font-display font-bold text-xl mb-1">{user?.username}</h2>
            )}

            <p className="text-white/40 text-sm mb-4">{user?.email}</p>

            {/* Bio */}
            <div className="mb-4">
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Bio</label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
                />
              ) : (
                <p className="text-white/60 text-sm">{user?.bio || 'No bio yet.'}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-white/50 text-xs font-medium mb-2 block">Status</label>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={async () => {
                      await api.patch('/api/users/status', { status: s });
                      updateUser({ status: s });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${user?.status === s ? 'bg-violet-600 text-white' : 'bg-white/[0.06] text-white/40 hover:text-white/70 border border-white/[0.08]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
