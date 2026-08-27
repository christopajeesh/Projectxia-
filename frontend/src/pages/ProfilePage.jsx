import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  UserCheck,
  Github,
  Linkedin,
  Globe,
  Edit3,
  CheckCircle2,
  Sparkles,
  Upload,
  Camera,
  Code,
  ExternalLink,
  Sliders,
  DollarSign,
  Trash2,
  Save,
} from 'lucide-react';
import EditSellOrderModal from '../components/ui/EditSellOrderModal';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSound();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const fileInputRef = useRef(null);

  if (!user && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-mono text-xs text-slate-300">
        <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
        <h2 className="text-xl font-display font-bold text-white">Access Your Creator Profile</h2>
        <p className="text-slate-400 max-w-sm">Please log in or register to view your creator dashboard, listed projects, and author tools.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [activeEditProject, setActiveEditProject] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    education: user?.education || '',
    experience: user?.experience || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    skills: (Array.isArray(user?.skills) ? user.skills : []).join(', '),
  });

  // Default Initials SVG Avatar generator
  const getInitialsAvatar = (name, email) => {
    const seed = encodeURIComponent(name || email || 'User');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=080e1e,101f4e&textColor=00f0ff`;
  };

  const userAvatar = user?.avatar || getInitialsAvatar(user?.name, user?.email);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        education: user.education || '',
        experience: user.experience || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        skills: (Array.isArray(user.skills) ? user.skills : []).join(', '),
      });
    }
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      const res = await api.get('/users/dashboard-stats');
      if (res?.data) {
        setStatsData(res.data);
      }
    } catch (e) {}
  };

  // Compress image before saving
  const compressImage = (file, maxWidth = 400, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 8MB.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const base64Photo = await compressImage(file);

      const res = await api.put('/users/avatar', { avatar: base64Photo });
      if (res.data?.user) {
        sessionStorage.setItem('projectxia_user', JSON.stringify(res.data.user));
      }

      playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSaveMsg('Profile photo updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
      window.location.reload();
    } catch (err) {
      console.error('Avatar update failed:', err);
      alert(err.response?.data?.message || 'Failed to update profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    playClick();
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: skillsArray,
      };

      const res = await api.put('/users/profile', payload);
      if (res.data?.user) {
        sessionStorage.setItem('projectxia_user', JSON.stringify(res.data.user));
      }

      playSuccess();
      setIsEditing(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    playClick();
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="relative min-h-screen pt-8 pb-24 font-mono text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {saveMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-center font-bold font-display text-sm animate-pulse">
            ✓ {saveMsg}
          </div>
        )}

        {/* Super Admin Executive Banner (Visible ONLY to theprojectxia@gmail.com) */}
        {user?.email?.toLowerCase() === 'theprojectxia@gmail.com' && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/80 via-purple-950/70 to-cyan-950/80 border border-rose-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-display font-black text-white">ProjectXia Executive Admin Control</h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-900 text-rose-200 border border-rose-400 font-bold uppercase">
                    Owner Access
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                  Manage all client custom build inquiries, update live pipeline statuses, inspect user activity telemetry, and export reports.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-display font-black text-xs transition-all shadow-xl hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <span>Open Admin Leads & Reports HUD →</span>
            </Link>
          </div>
        )}

        {/* MAIN PROFILE CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Picture with Upload Camera Overlay */}
              <div className="relative group">
                <img
                  src={userAvatar}
                  alt={user?.name || 'User Avatar'}
                  className="w-28 h-28 rounded-3xl object-cover border-2 border-cyan-400 shadow-2xl bg-gray-900"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 cursor-pointer text-[10px] font-bold p-1 gap-1"
                >
                  <Camera className="w-6 h-6 text-cyan-400" />
                  <span>{isUploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {user?.name || user?.email?.split('@')?.[0] || 'Innovator'}
                  </h1>
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                </div>

                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold inline-block text-[11px]">
                  {user?.email?.toLowerCase() === 'theprojectxia@gmail.com'
                    ? '🛡️ ProjectXia Core Team & Administrator'
                    : '✓ Verified Member'}
                </span>

                <p className="text-slate-400 max-w-xl font-sans text-xs">
                  {user?.bio || "Innovator and software developer building next-gen solutions on ProjectXia."}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons: Upload Photo, Edit Profile & Prominent Logout */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 cursor-pointer text-xs transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 hover:text-white font-display font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all shadow-md hover:scale-105"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3.5 rounded-2xl bg-gray-900 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Listed Projects</span>
                <span className="text-cyan-400 font-bold text-base font-display">
                  {statsData?.uploadedProjects?.length || 0}
                </span>
              </div>
              <Link
                to="/upload"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-bold"
              >
                + List Project
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900 border border-purple-500/20">
              <span className="text-slate-500 block text-[10px]">Ecosystem Role</span>
              <span className="text-purple-300 font-bold text-xs flex items-center gap-1 mt-1">
                {user?.role?.toUpperCase() || 'VERIFIED INNOVATOR'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900 border border-emerald-500/20">
              <span className="text-slate-500 block text-[10px]">Account Security</span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
              </span>
            </div>
          </div>

          {/* EDIT PROFILE FORM */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-gray-900/90 border border-cyan-500/30 space-y-4">
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Profile Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Education / College</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bio / About You</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell other engineers and project seekers about your engineering work and interests..."
                  className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Portfolio / Website</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-display flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* Social Links */
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {formData.github && (
                <a
                  href={formData.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <Github className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Profile</span>
                </a>
              )}
              {formData.linkedin && (
                <a
                  href={formData.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {formData.portfolio && (
                <a
                  href={formData.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Personal Portfolio</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* MY LISTED PROJECTS SECTION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <span>My Listed Engineering Projects</span>
            </h3>
            <Link
              to="/upload"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs transition-all shadow-md"
            >
              + List New Project
            </Link>
          </div>

          {(statsData?.uploadedProjects || []).length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Code className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400">You haven't listed any engineering projects yet.</p>
              <p className="text-[11px] text-slate-500">Upload your source code & schematics to start monetizing on ProjectXia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statsData?.uploadedProjects?.map((p) => (
                <div
                  key={p?._id || p?.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-900/90 border border-slate-800 hover:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">{p?.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        ₹{Number(p?.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="text-cyan-400">{p?.category || 'Engineering'}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Security Audit: {p?.securityScanStatus || 'Passed 100%'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setActiveEditProject(p);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-black font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Price / Edit</span>
                    </button>

                    <Link
                      to={`/projects/${p?._id || p?.id}`}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Sell Order & Price Adjuster Modal */}
      {activeEditProject && (
        <EditSellOrderModal
          isOpen={!!activeEditProject}
          project={activeEditProject}
          onClose={() => setActiveEditProject(null)}
          onProjectUpdated={(updatedProject) => {
            setStatsData((prev) => {
              if (!prev) return prev;
              const updatedList = (prev.uploadedProjects || []).map((p) =>
                (p._id || p.id) === (updatedProject._id || updatedProject.id) ? updatedProject : p
              );
              return { ...prev, uploadedProjects: updatedList };
            });
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
