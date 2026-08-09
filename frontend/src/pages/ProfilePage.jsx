import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Award,
  BookOpen,
  Briefcase,
  Smartphone,
  CreditCard,
  Download,
  Building,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Upload,
  Bookmark,
  Code,
  PhoneCall,
  Lightbulb,
  Mail,
  Lock,
  Camera,
  Save,
  X,
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import CustomSoftwareRequestModal from '../components/ui/CustomSoftwareRequestModal';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const { playClick, playSuccess } = useSound();
  const { user, updateUserData } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Custom Software Inquiries with ProjectXia Developing Team
  const [myInquiries, setMyInquiries] = useState([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalTab, setCustomModalTab] = useState('idea');

  // Stats / User Projects
  const [statsData, setStatsData] = useState(null);

  // KYC and Payouts State
  const [kycData, setKycData] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    gstin: '',
  });

  const [earnings, setEarnings] = useState({
    grossSales: 0,
    platformCommission: 0,
    tdsDeduction: 0,
    availableBalance: 0,
    totalDownloads: 0,
  });
  const [withdrawMsg, setWithdrawMsg] = useState('');

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
    fetchEarnings();
    fetchMyInquiries();
    fetchUserProjects();
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/payouts/earnings');
      if (res.data?.earnings) {
        setEarnings(res.data.earnings);
        if (res.data.earnings.kyc) {
          setKycData((prev) => ({
            ...prev,
            ...res.data.earnings.kyc,
          }));
        }
      }
    } catch (e) {}
  };

  const fetchMyInquiries = async () => {
    try {
      const res = await api.get('/agency/my-inquiries');
      if (res?.data?.inquiries) {
        setMyInquiries(res.data.inquiries);
      }
    } catch (e) {}
  };

  const fetchUserProjects = async () => {
    try {
      const res = await api.get('/users/dashboard-stats');
      if (res?.data) {
        setStatsData(res.data);
      }
    } catch (e) {}
  };

  const handleInquiryAdded = (newInquiry) => {
    setMyInquiries((prev) => [newInquiry, ...prev]);
    setActiveTab('software_requests');
  };

  // Compress image before saving to keep payload fast and lightweight
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

  // Profile Picture File Upload Handler
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      playClick();
      const compressedBase64 = await compressImage(file, 400, 0.85);

      const res = await api.put('/users/profile', { avatar: compressedBase64 });
      if (res.data?.user) {
        updateUserData(res.data.user);
        playSuccess();
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setSaveMsg('Profile picture updated successfully!');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      alert(err.response?.data?.message || 'Failed to update profile picture.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    playClick();
    try {
      const payload = {
        name: formData.name?.trim() || user?.name || 'Innovator',
        bio: formData.bio || '',
        education: formData.education || '',
        experience: formData.experience || '',
        github: formData.github || '',
        linkedin: formData.linkedin || '',
        portfolio: formData.portfolio || '',
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await api.put('/users/profile', payload);

      if (res.data?.user) {
        updateUserData(res.data.user);
        setIsEditing(false);
        playSuccess();
        confetti({ particleCount: 50, spread: 60 });
        setSaveMsg('Profile details saved successfully.');
        setTimeout(() => setSaveMsg(''), 4000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      alert(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  const handleUpdateKyc = async (e) => {
    e.preventDefault();
    playClick();
    try {
      await api.post('/payouts/kyc', kycData);
      setSaveMsg('Creator KYC & Tax Details verified.');
      playSuccess();
      confetti({ particleCount: 50, spread: 60 });
      setTimeout(() => setSaveMsg(''), 4000);
      fetchEarnings();
    } catch (e) {
      alert('Failed to save KYC details.');
    }
  };

  const handleWithdraw = async () => {
    playClick();
    if (earnings.availableBalance <= 0) {
      alert('No available royalties to withdraw yet.');
      return;
    }
    try {
      const res = await api.post('/payouts/withdraw', { amount: earnings.availableBalance });
      setWithdrawMsg(res.data?.message || 'Payout initiated.');
      playSuccess();
      confetti({ particleCount: 70, spread: 70 });
      fetchEarnings();
    } catch (e) {
      alert(e.response?.data?.message || 'Withdrawal failed.');
    }
  };

  return (
    <div className="relative min-h-screen pt-8 pb-24 font-mono text-xs">
      <AuroraBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {saveMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-center font-bold font-display text-sm animate-pulse">
            ✓ {saveMsg}
          </div>
        )}

        {/* Unified Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gray-950/90 border border-slate-800 backdrop-blur-xl">
          {[
            { id: 'overview', label: '👤 Profile & Bio' },
            { id: 'software_requests', label: `🚀 ProjectXia Software Requests (${myInquiries.length})` },
            { id: 'my_projects', label: `📦 My Projects (${statsData?.uploadedProjects?.length || 0})` },
            { id: 'saved_projects', label: `🔖 Saved Bookmarks (${statsData?.savedProjects?.length || 0})` },
            { id: 'kyc_payouts', label: '💰 KYC & Payouts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PROFILE OVERVIEW & REAL DATA                      */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
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
                    {user?.bio || "No bio added yet. Click 'Edit Profile' to add your technical specializations and background."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>

            {/* REAL Dynamic User Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-cyan-500/20">
                <span className="text-slate-500 block text-[10px]">Listed Projects</span>
                <span className="text-cyan-400 font-bold text-base font-display">
                  {statsData?.uploadedProjects?.length || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-purple-500/20">
                <span className="text-slate-500 block text-[10px]">Saved Bookmarks</span>
                <span className="text-purple-400 font-bold text-base font-display">
                  {statsData?.savedProjects?.length || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-emerald-500/20">
                <span className="text-slate-500 block text-[10px]">Custom Enquiries</span>
                <span className="text-emerald-400 font-bold text-base font-display">
                  {myInquiries?.length || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-amber-500/20">
                <span className="text-slate-500 block text-[10px]">Account Security</span>
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
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
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400"
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
              /* Social Links (only shown if configured) */
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
        )}

        {/* ======================================================== */}
        {/* TAB 2: PROJECTXIA SOFTWARE REQUESTS & CALLBACK STATUS    */}
        {/* ======================================================== */}
        {activeTab === 'software_requests' && (
          <div className="p-8 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>ProjectXia Core Team Software Builds & Callbacks</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  All inquiries sent directly to <strong>theprojectxia@gmail.com</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setCustomModalTab('idea');
                    setIsCustomModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs cursor-pointer transition-all"
                >
                  + Share New Idea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setCustomModalTab('callback');
                    setIsCustomModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-display font-bold text-xs cursor-pointer transition-all"
                >
                  + Request Callback
                </button>
              </div>
            </div>

            {myInquiries.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-gray-900/60 border border-slate-800 p-6 space-y-4">
                <Lightbulb className="w-10 h-10 text-cyan-400/60 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-display font-bold text-white">No active custom build requests</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                    Have a unique software idea, AI model, or capstone requirement? Work directly with verified ProjectXia developers.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setCustomModalTab('idea');
                      setIsCustomModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold font-display text-xs cursor-pointer hover:bg-cyan-400 transition-all"
                  >
                    Share Software Idea
                  </button>
                </div>
              </div>
            ) : (
              myInquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="p-5 rounded-2xl bg-gray-900/90 border border-cyan-500/30 hover:border-cyan-500/50 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inq.type === 'CALLBACK_REQUEST'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {inq.type === 'CALLBACK_REQUEST' ? '📞 CALLBACK ENQUIRY' : '💡 CUSTOM SOFTWARE IDEA'}
                      </span>
                      <span className="text-slate-400 text-[11px]">Ref: {inq._id}</span>
                    </div>

                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      Directly Dispatched to: theprojectxia@gmail.com
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-display font-bold text-white tracking-tight">{inq.projectTitle}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-slate-800 font-sans">
                      {inq.requirements || inq.description}
                    </p>
                  </div>

                  {/* Details Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-400 bg-gray-950/80 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Department:</span>
                      <span className="text-white">{inq.dept || inq.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Budget:</span>
                      <span className="text-cyan-400 font-bold">{inq.budgetRange || inq.budget}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Consultation:</span>
                      <span className="text-purple-300">{inq.consultationMode || 'Phone Call'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Preferred Slot:</span>
                      <span className="text-white">{inq.preferredTimeSlot || 'Flexible'}</span>
                    </div>
                  </div>

                  {/* Visual Status Stepper */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 block mb-2">DEVELOPMENT PIPELINE PROGRESS:</span>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-mono">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        ✓ 1. Sent to Lead Email
                      </div>
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse font-bold">
                        ⚡ 2. Architect Review
                      </div>
                      <div className="p-2 rounded-lg bg-gray-950 text-slate-500 border border-slate-800">
                        3. Callback & Scope
                      </div>
                      <div className="p-2 rounded-lg bg-gray-950 text-slate-500 border border-slate-800">
                        4. Milestone Delivery
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY UPLOADED REPOSITORIES                          */}
        {/* ======================================================== */}
        {activeTab === 'my_projects' && (
          <div className="p-8 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>My Listed Repositories</span>
              </h3>
              <Link
                to="/upload"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-display font-bold text-xs"
              >
                + List New Project
              </Link>
            </div>

            {(statsData?.uploadedProjects || []).length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p>You haven't listed any engineering projects yet.</p>
              </div>
            ) : (
              statsData?.uploadedProjects?.map((p) => (
                <div key={p?._id || p?.id} className="p-4 rounded-2xl bg-gray-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{p?.title}</h4>
                    <span className="text-[10px] text-emerald-400">Status: {p?.securityScanStatus || 'Passed 100%'}</span>
                  </div>
                  <Link to={`/projects/${p?._id || p?.id}`} className="text-xs text-cyan-400 hover:underline">
                    View Live Page →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SAVED BOOKMARKS                                   */}
        {/* ======================================================== */}
        {activeTab === 'saved_projects' && (
          <div className="p-8 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Saved Bookmarks</span>
            </h3>

            {(statsData?.savedProjects || []).length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p>No saved projects yet. Browse the marketplace and bookmark items.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statsData?.savedProjects?.map((p) => (
                  <div key={p?._id || p?.id} className="p-4 rounded-2xl bg-gray-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">{p?.title}</h4>
                      <p className="text-xs text-cyan-400">₹{(p?.price || 2499)?.toLocaleString('en-IN')}</p>
                    </div>
                    <Link
                      to={`/projects/${p?._id || p?.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs hover:bg-cyan-500/30 transition-all"
                    >
                      Inspect
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KYC & PAYOUTS                                     */}
        {/* ======================================================== */}
        {activeTab === 'kyc_payouts' && (
          <div className="p-8 rounded-3xl bg-gray-950/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Creator Payouts & Verified Bank Settlement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-900 border border-slate-800">
                <span className="text-slate-500 block">Gross Sales</span>
                <span className="text-xl font-bold text-white">₹{earnings.grossSales?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-900 border border-slate-800">
                <span className="text-slate-500 block">Platform Fee & TDS</span>
                <span className="text-xl font-bold text-rose-400">₹{(earnings.platformCommission + earnings.tdsDeduction)?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-emerald-400 block font-bold">Available for Withdrawal</span>
                <span className="text-xl font-black text-emerald-300">₹{earnings.availableBalance?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* KYC Form */}
            <form onSubmit={handleUpdateKyc} className="p-5 rounded-2xl bg-gray-900/80 border border-slate-800 space-y-4">
              <h4 className="font-display font-bold text-white text-sm">Settlement Bank & UPI Account Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">UPI ID (Instant Transfer)</label>
                  <input
                    type="text"
                    value={kycData.upiId}
                    onChange={(e) => setKycData({ ...kycData, upiId: e.target.value })}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={kycData.bankName}
                    onChange={(e) => setKycData({ ...kycData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={kycData.accountNumber}
                    onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })}
                    placeholder="e.g. 984729104829"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={kycData.ifscCode}
                    onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={kycData.panNumber}
                    onChange={(e) => setKycData({ ...kycData, panNumber: e.target.value })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={kycData.gstin}
                    onChange={(e) => setKycData({ ...kycData, gstin: e.target.value })}
                    placeholder="e.g. 33ABCDE1234F1Z5"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-display font-bold text-xs cursor-pointer"
              >
                Save Bank & Tax Info
              </button>
            </form>

            <button
              onClick={handleWithdraw}
              disabled={earnings.availableBalance <= 0}
              className={`w-full py-3 rounded-2xl font-display font-bold text-xs shadow-lg transition-all cursor-pointer ${
                earnings.availableBalance > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
                  : 'bg-gray-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Withdraw Balance to Bank Account (Instant IMPS / UPI)
            </button>

            {withdrawMsg && <p className="text-emerald-400 text-center font-bold">{withdrawMsg}</p>}
          </div>
        )}
      </div>

      {/* Global Interactive Custom Software Request Modal */}
      <CustomSoftwareRequestModal
        isOpen={isCustomModalOpen}
        initialTab={customModalTab}
        onClose={() => setIsCustomModalOpen(false)}
        onInquirySubmitted={handleInquiryAdded}
      />
    </div>
  );
};

export default ProfilePage;
