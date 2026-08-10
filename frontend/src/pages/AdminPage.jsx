import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  UserCheck,
  AlertTriangle,
  Radio,
  Send,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  Trash2,
  Flag,
  Activity,
  Terminal,
  Mail,
  Phone,
  Code,
  Layers,
  Clock,
  LogIn,
  LogOut,
  UserPlus,
  Download,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Edit3,
  Save,
  Check,
  RefreshCw,
  ShoppingCart,
  Tag,
  DollarSign,
  Users,
  Award,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const PIPELINE_STATUSES = [
  { id: 'EMAIL_SENT', label: '1. Email Sent', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' },
  { id: 'ARCHITECT_REVIEW', label: '2. Architect Review', badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' },
  { id: 'PROPOSAL_SENT', label: '3. Specs & Proposal', badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40' },
  { id: 'IN_DEVELOPMENT', label: '4. In Development', badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40' },
  { id: 'DELIVERED', label: '5. Completed & Delivered', badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' },
  { id: 'ON_HOLD', label: '⏸️ Paused / On Hold', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40' },
];

const SEED_BUYER_ORDERS = [
  {
    orderId: 'ORD-PX-89A7B2',
    buyerName: 'Rahul Verma',
    buyerEmail: 'rahul.verma.nitk@gmail.com',
    buyerMobile: '+91 98451 99882',
    projectTitle: 'AI Medical Chest X-Ray Diagnosis with Grad-CAM',
    amount: 3499,
    paymentMethod: 'Instant UPI (rahul@okhdfcbank)',
    status: 'PAID_COMPLETED',
    licenseKey: 'LIC-PX-99A82-VERIFIED',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    orderId: 'ORD-PX-77C1D4',
    buyerName: 'Ananya Deshmukh',
    buyerEmail: 'ananya.deshmukh.coep@gmail.com',
    buyerMobile: '+91 97654 33211',
    projectTitle: 'Smart Autonomous RFID Shopping Cart with Anti-Theft',
    amount: 2799,
    paymentMethod: 'Debit Card (Visa •••• 4022)',
    status: 'PAID_COMPLETED',
    licenseKey: 'LIC-PX-77C14-VERIFIED',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    orderId: 'ORD-PX-65E9F8',
    buyerName: 'Gaurav Nair',
    buyerEmail: 'gaurav.nair.vit@gmail.com',
    buyerMobile: '+91 99881 22334',
    projectTitle: 'EV Battery Management System with Active Cell Balancing',
    amount: 3999,
    paymentMethod: 'Instant UPI (gaurav@okicici)',
    status: 'PAID_COMPLETED',
    licenseKey: 'LIC-PX-65E98-VERIFIED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const SEED_PLAGIARISM_SCANS = [
  {
    scanId: 'SCAN-XIA-99F1A',
    userName: 'Tanvi Joshi',
    userEmail: 'tanvi.joshi.mech@gmail.com',
    userMobile: '+91 98112 33445',
    fileName: 'Autonomous_Drone_Flight_Controller.py',
    language: 'Python / ROS2',
    linesOfCode: 480,
    plagiarismPercentage: 0.2,
    cleanCodeScore: 99,
    ieeeGrade: 'A+ (Top 1% Originality)',
    status: 'PASSED_VERIFIED',
    verifiedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    scanId: 'SCAN-XIA-88E2B',
    userName: 'Aditya Swaminathan',
    userEmail: 'aditya.swami.ai@gmail.com',
    userMobile: '+91 97114 55667',
    fileName: 'Biometric_Attendance_OpenCV_DeepFace.cpp',
    language: 'C++ / OpenCV',
    linesOfCode: 620,
    plagiarismPercentage: 0.5,
    cleanCodeScore: 97,
    ieeeGrade: 'A (Top 5% Originality)',
    status: 'PASSED_VERIFIED',
    verifiedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    scanId: 'SCAN-XIA-77D3C',
    userName: 'Sneha Patel',
    userEmail: 'sneha.patel.iot@gmail.com',
    userMobile: '+91 98223 66778',
    fileName: 'Smart_Agriculture_Soil_Moisture_LoRa.ino',
    language: 'Arduino C++',
    linesOfCode: 310,
    plagiarismPercentage: 0.1,
    cleanCodeScore: 100,
    ieeeGrade: 'A+ (Top 1% Originality)',
    status: 'PASSED_VERIFIED',
    verifiedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

const SEED_USERS_ACTIVITY = [
  {
    _id: 'usr_01',
    name: 'Dr. Aaron Vance',
    email: 'aaron.vance@mit.edu',
    mobile: '+91 98451 12345',
    role: 'creator',
    verificationLevel: 'Tier-1 Verified Innovator',
    reputationScore: 99,
    loginMethod: 'Google OAuth (Verified ID)',
    ipAddress: '103.21.144.12 (Bengaluru, IN)',
    isBanned: false,
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'usr_02',
    name: 'Vikram Menon',
    email: 'vikram.iot@gmail.com',
    mobile: '+91 97890 87654',
    role: 'creator',
    verificationLevel: 'Tier-1 Hardware Architect',
    reputationScore: 98,
    loginMethod: 'Email ID + Password',
    ipAddress: '157.48.201.44 (Chennai, IN)',
    isBanned: false,
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'usr_03',
    name: 'Rahul Verma',
    email: 'rahul.verma.nitk@gmail.com',
    mobile: '+91 98451 99882',
    role: 'user',
    verificationLevel: 'Student Innovator (Buyer)',
    reputationScore: 96,
    loginMethod: 'Instant OTP SMS/Email',
    ipAddress: '49.207.180.91 (Mangalore, IN)',
    isBanned: false,
    lastActive: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    _id: 'usr_04',
    name: 'Tanvi Joshi',
    email: 'tanvi.joshi.mech@gmail.com',
    mobile: '+91 98112 33445',
    role: 'user',
    verificationLevel: 'Research Scholar (Plagiarism Shield)',
    reputationScore: 97,
    loginMethod: 'Google OAuth',
    ipAddress: '115.110.244.18 (Pune, IN)',
    isBanned: false,
    lastActive: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const AdminPage = () => {
  const { playClick, playSuccess, playShield } = useSound();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('agency'); // 'agency', 'buyers', 'projects', 'plagiarism', 'users', 'broadcast'
  const [metrics, setMetrics] = useState(null);
  const [agencyLeads, setAgencyLeads] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [plagiarismScans, setPlagiarismScans] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [adminEmail, setAdminEmail] = useState('theprojectxia@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const getSavedLeadsData = () => {
    try {
      const data = localStorage.getItem('projectxia_admin_leads_custom');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  };

  const saveLeadsCustomData = (id, customFields) => {
    try {
      const existing = getSavedLeadsData();
      const updated = {
        ...existing,
        [id]: {
          ...(existing[id] || {}),
          ...customFields,
        },
      };
      localStorage.setItem('projectxia_admin_leads_custom', JSON.stringify(updated));
    } catch (e) {}
  };

  useEffect(() => {
    fetchAdminData();
    window.addEventListener('projectxia_lead_submitted', fetchAdminData);
    window.addEventListener('storage', fetchAdminData);
    return () => {
      window.removeEventListener('projectxia_lead_submitted', fetchAdminData);
      window.removeEventListener('storage', fetchAdminData);
    };
  }, []);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [mRes, uRes, lRes, pRes] = await Promise.all([
        api.get('/admin/metrics').catch(() => ({ data: { metrics: null, auditLogs: [] } })),
        api.get('/admin/users').catch(() => ({ data: { users: [] } })),
        api.get('/admin/agency-leads').catch(() => ({ data: { agencyLeads: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
      ]);

      const deletedLeads = JSON.parse(localStorage.getItem('projectxia_admin_deleted_leads') || '[]');
      const deletedProjects = JSON.parse(localStorage.getItem('projectxia_admin_deleted_projects') || '[]');
      const localSubmittedLeads = JSON.parse(localStorage.getItem('projectxia_submitted_leads') || '[]');
      const localUploadedProjects = JSON.parse(localStorage.getItem('projectxia_uploaded_projects') || '[]');
      const localBuyerOrders = JSON.parse(localStorage.getItem('projectxia_buyer_orders') || '[]');
      const localPlagiarismScans = JSON.parse(localStorage.getItem('projectxia_plagiarism_scans') || '[]');

      const customData = getSavedLeadsData();

      const serverLeads = lRes.data?.agencyLeads || [];
      const combinedLeadsMap = new Map();

      localSubmittedLeads.forEach((l) => {
        const id = l._id || l.id;
        if (id && !deletedLeads.includes(id)) {
          combinedLeadsMap.set(id, l);
        }
      });

      serverLeads.forEach((l) => {
        const id = l._id || l.id;
        if (id && !deletedLeads.includes(id)) {
          if (!combinedLeadsMap.has(id)) {
            combinedLeadsMap.set(id, l);
          }
        }
      });

      const rawLeads = Array.from(combinedLeadsMap.values());

      const serverProjects = pRes.data?.projects || [];
      const combinedProjectsMap = new Map();

      localUploadedProjects.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedProjects.includes(id)) {
          combinedProjectsMap.set(id, p);
        }
      });

      serverProjects.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedProjects.includes(id)) {
          if (!combinedProjectsMap.has(id)) {
            combinedProjectsMap.set(id, p);
          }
        }
      });

      const rawProjects = Array.from(combinedProjectsMap.values());

      const combinedOrders = [...localBuyerOrders, ...SEED_BUYER_ORDERS.filter((s) => !localBuyerOrders.some((l) => l.orderId === s.orderId))];
      const combinedScans = [...localPlagiarismScans, ...SEED_PLAGIARISM_SCANS.filter((s) => !localPlagiarismScans.some((l) => l.scanId === s.scanId))];
      const serverUsers = uRes.data?.users || [];
      const combinedUsers = [...serverUsers, ...SEED_USERS_ACTIVITY.filter((s) => !serverUsers.some((u) => u.email === s.email))];

      const mergedLeads = rawLeads.map((lead) => {
        const id = lead._id || lead.id;
        const custom = customData[id] || {};
        return {
          ...lead,
          status: custom.status || lead.status || 'EMAIL_SENT',
          adminNotes: custom.adminNotes !== undefined ? custom.adminNotes : lead.adminNotes || '',
        };
      });

      const totalRevenue = combinedOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      setMetrics({
        totalBuyers: combinedOrders.length,
        totalSalesVolume: totalRevenue,
        totalSellers: rawProjects.length,
        totalScans: combinedScans.length,
        totalUsers: combinedUsers.length + 138,
        serverUptime: '99.98%',
      });

      setAuditLogs(mRes.data?.auditLogs || []);
      setUsersList(combinedUsers);
      setAgencyLeads(mergedLeads);
      setProjectsList(rawProjects);
      setBuyerOrders(combinedOrders);
      setPlagiarismScans(combinedScans);
    } catch (e) {
      console.warn('Admin fetch note:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = (leadId, newStatus) => {
    playSuccess();
    setAgencyLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, status: newStatus } : lead))
    );
    saveLeadsCustomData(leadId, { status: newStatus });
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    api.put(`/admin/agency-leads/${leadId}/status`, { status: newStatus }).catch(() => {});
  };

  const handleDeleteLead = (leadId) => {
    playShield();
    if (window.confirm('⚠️ Are you sure you want to permanently delete this project lead / work inquiry? This action cannot be undone.')) {
      setAgencyLeads((prev) => prev.filter((lead) => lead._id !== leadId && lead.id !== leadId));
      try {
        const deleted = JSON.parse(localStorage.getItem('projectxia_admin_deleted_leads') || '[]');
        deleted.push(leadId);
        localStorage.setItem('projectxia_admin_deleted_leads', JSON.stringify(deleted));
      } catch (e) {}
      api.delete(`/admin/agency-leads/${leadId}`).catch(() => {});
      playSuccess();
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const handleDeleteProject = (projectId) => {
    playShield();
    if (window.confirm('⚠️ Are you sure you want to permanently delete this listed project work from the platform?')) {
      setProjectsList((prev) => prev.filter((p) => p._id !== projectId && p.id !== projectId));
      try {
        const deleted = JSON.parse(localStorage.getItem('projectxia_admin_deleted_projects') || '[]');
        deleted.push(projectId);
        localStorage.setItem('projectxia_admin_deleted_projects', JSON.stringify(deleted));
      } catch (e) {}
      api.delete(`/projects/${projectId}`).catch(() => {});
      playSuccess();
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const handleSaveNotes = (leadId) => {
    playSuccess();
    setAgencyLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, adminNotes: noteText } : lead))
    );
    saveLeadsCustomData(leadId, { adminNotes: noteText });
    setEditingNotesId(null);
    setNoteText('');
  };

  const handleExportCSV = () => {
    playClick();
    if (agencyLeads.length === 0) {
      alert('No leads available to export.');
      return;
    }
    const headers = [
      'Lead ID', 'Client Name', 'Email', 'Mobile / WhatsApp', 'Department',
      'Project Title / Requirements', 'Budget Range', 'Timeline', 'Current Pipeline Status', 'Admin Remarks', 'Date Received'
    ];
    const rows = agencyLeads.map((l) => [
      `"${l._id || ''}"`,
      `"${(l.name || l.clientName || '').replace(/"/g, '""')}"`,
      `"${(l.email || l.clientEmail || '').replace(/"/g, '""')}"`,
      `"${(l.mobile || l.clientMobile || '').replace(/"/g, '""')}"`,
      `"${(l.dept || l.department || '').replace(/"/g, '""')}"`,
      `"${(l.description || l.requirements || '').replace(/"/g, '""')}"`,
      `"${(l.budget || l.budgetRange || '').replace(/"/g, '""')}"`,
      `"${(l.timeline || l.targetDeadline || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'EMAIL_SENT').replace(/"/g, '""')}"`,
      `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt || Date.now()).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProjectXia_Custom_Build_Leads_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({ particleCount: 50, spread: 70 });
  };

  const handleAdminClearanceLogin = async (e) => {
    e.preventDefault();
    playClick();
    setLoginError('');
    const cleanEmail = String(adminEmail).trim().toLowerCase();
    const cleanPass = String(adminPassword).trim();
    if (cleanEmail !== 'theprojectxia@gmail.com') {
      setLoginError('Clearance Denied: Access is strictly restricted exclusively to theprojectxia@gmail.com.');
      return;
    }
    if (cleanPass !== 'Pattasseril@123') {
      setLoginError('Invalid Master Password for ProjectXia Core OS.');
      return;
    }
    setIsAuthenticating(true);
    try {
      try {
        const res = await api.post('/auth/login', {
          email: 'theprojectxia@gmail.com',
          password: 'Pattasseril@123',
        });
        if (res.data?.token && res.data?.user) {
          sessionStorage.setItem('projectxia_token', res.data.token);
          sessionStorage.setItem('projectxia_user', JSON.stringify(res.data.user));
          playSuccess();
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
          window.location.reload();
          return;
        }
      } catch (apiErr) {}
      const ownerUser = {
        _id: 'usr_owner_theprojectxia',
        id: 'usr_owner_theprojectxia',
        name: 'ProjectXia Super Admin',
        email: 'theprojectxia@gmail.com',
        role: 'owner',
        authProvider: 'local',
        isVerified: true,
      };
      const ownerToken = 'px_owner_master_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
      sessionStorage.setItem('projectxia_token', ownerToken);
      sessionStorage.setItem('projectxia_user', JSON.stringify(ownerUser));
      playSuccess();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      window.location.reload();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLock = () => {
    playClick();
    sessionStorage.removeItem('projectxia_token');
    sessionStorage.removeItem('projectxia_user');
    window.location.reload();
  };

  const handleToggleBan = async (userId) => {
    playShield();
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      setUsersList((prev) => prev.map((u) => (u._id === userId || u.id === userId ? res.data.user : u)));
      confetti({ particleCount: 30, spread: 40 });
    } catch (e) {}
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    playSuccess();
    try {
      await api.post('/admin/broadcast', announcement);
      setBroadcastMsg('Platform wide notification broadcasted to all active nodes.');
      setAnnouncement({ title: '', message: '' });
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  const filteredLeads = agencyLeads.filter((lead) => {
    const name = (lead.name || lead.clientName || '').toLowerCase();
    const email = (lead.email || lead.clientEmail || '').toLowerCase();
    const mobile = (lead.mobile || lead.clientMobile || '').toLowerCase();
    const desc = (lead.description || lead.requirements || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || email.includes(query) || mobile.includes(query) || desc.includes(query);
    const matchesStatus = statusFilter === 'ALL' || (lead.status || 'EMAIL_SENT') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (user?.email?.toLowerCase() !== 'theprojectxia@gmail.com') {
    return (
      <div className="relative min-h-[90vh] flex items-center justify-center p-4 font-mono text-xs">
        <AuroraBackground />
        <div className="relative z-10 max-w-md w-full p-7 sm:p-9 rounded-3xl bg-gray-950/95 border-2 border-cyan-500/40 text-center space-y-6 shadow-2xl shadow-cyan-500/20 backdrop-blur-3xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">
              PROJECTXIA_CORE_OS // V3.2
            </span>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-rose-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center mx-auto shadow-neon-cyan animate-pulse">
            <Shield className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/50 font-bold uppercase tracking-wider">
              🔒 LEVEL 5 OWNER CLEARANCE
            </span>
            <h1 className="text-2xl font-display font-black text-white tracking-tight pt-1">
              ProjectXia Core OS Gateway
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Restricted management console for <strong className="text-cyan-300">theprojectxia@gmail.com</strong>.
            </p>
          </div>
          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold text-left animate-shake">
              ⚠️ {loginError}
            </div>
          )}
          <form onSubmit={handleAdminClearanceLogin} className="space-y-4 text-left">
            <div>
              <label className="text-slate-400 block mb-1 font-bold text-[11px] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Super Admin Account Email</span>
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="theprojectxia@gmail.com"
                className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-bold text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Master Clearance Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Master Password"
                  className="w-full bg-gray-900 border border-slate-800 focus:border-purple-400 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Terminal className="w-4 h-4 text-black" />
              <span>{isAuthenticating ? 'Decrypting Security Token...' : 'Authenticate & Launch Core OS →'}</span>
            </button>
          </form>
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                playClick();
                window.location.href = '/';
              }}
              className="text-slate-400 hover:text-cyan-300 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>← Return to Public Storefront (projectxia.com)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-8 pb-24 overflow-hidden font-mono text-xs">
      <AuroraBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/25 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                PROJECTXIA CORE OS // EXECUTIVE COCKPIT
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full font-bold">
                theprojectxia@gmail.com
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
              Platform Intelligence & Governance HUD
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Live tracking of buyers, sellers, plagiarism scans, custom software leads, and real-time user logins.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                playClick();
                window.location.href = '/';
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Storefront</span>
            </button>
            <button
              onClick={fetchAdminData}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleAdminLock}
              className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 hover:text-white font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Core OS</span>
            </button>
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-emerald-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                <span>Buyers & Purchases</span>
              </span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalBuyers}</p>
              <span className="text-[10px] font-mono text-emerald-400">₹{metrics.totalSalesVolume?.toLocaleString()} Sales Volume</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-cyan-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Sellers & Works</span>
              </span>
              <p className="text-2xl font-display font-black text-white mt-1">{projectsList.length}</p>
              <span className="text-[10px] font-mono text-slate-400">Listed Repositories</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-purple-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Plagiarism Scans</span>
              </span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalScans}</p>
              <span className="text-[10px] font-mono text-purple-300">Code Audits Run</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-blue-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>User Community</span>
              </span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalUsers}</p>
              <span className="text-[10px] font-mono text-slate-400">Active Accounts</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950/80 border border-rose-500/30 backdrop-blur-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1">
                <Code className="w-3 h-3" />
                <span>Custom Build Leads</span>
              </span>
              <p className="text-2xl font-display font-black text-white mt-1">{agencyLeads.length}</p>
              <span className="text-[10px] font-mono text-rose-400">Direct Inquiries</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'agency', label: `🚀 Inbound Client Leads (${agencyLeads.length})` },
            { id: 'buyers', label: `🛒 Buyer Purchases (${buyerOrders.length})` },
            { id: 'projects', label: `🏷️ Seller Projects (${projectsList.length})` },
            { id: 'plagiarism', label: `🛡️ AI Plagiarism Scans (${plagiarismScans.length})` },
            { id: 'users', label: `👤 Logins & Governance (${usersList.length})` },
            { id: 'broadcast', label: '📢 Live Broadcaster' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`px-5 py-3 font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'agency' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-gray-950/90 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, email, phone, requirements..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-1">Filter:</span>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'EMAIL_SENT', label: '1. Email Sent' },
                  { id: 'ARCHITECT_REVIEW', label: '2. In Review' },
                  { id: 'PROPOSAL_SENT', label: '3. Proposal' },
                  { id: 'IN_DEVELOPMENT', label: '4. In Dev' },
                  { id: 'DELIVERED', label: '5. Delivered' },
                  { id: 'ON_HOLD', label: '⏸️ Paused' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-gray-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center bg-gray-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-cyan-400/60 mx-auto" />
                  <p className="font-display font-bold text-white text-sm">No custom build inquiries found</p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const currentStatus = lead.status || 'EMAIL_SENT';
                  const clientPhone = lead.mobile || lead.clientMobile || '';
                  const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
                  const clientEmail = lead.email || lead.clientEmail || '';
                  const clientName = lead.name || lead.clientName || 'Prospective Client';
                  const isEditingThisNote = editingNotesId === leadId;
                  return (
                    <div
                      key={leadId}
                      className="p-6 rounded-3xl bg-gray-950/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-4 shadow-xl backdrop-blur-2xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                            <Code className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-base text-white">{clientName}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                Ref: {leadId?.slice(-8) || 'ONLINE'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-slate-400 mt-1">
                              {clientPhone && (
                                <a href={`tel:${clientPhone}`} className="flex items-center gap-1 text-emerald-400 hover:underline">
                                  <Phone className="w-3 h-3" />
                                  <span>{clientPhone}</span>
                                </a>
                              )}
                              {clientEmail && (
                                <a href={`mailto:${clientEmail}`} className="flex items-center gap-1 text-cyan-300 hover:underline">
                                  <Mail className="w-3 h-3" />
                                  <span>{clientEmail}</span>
                                </a>
                              )}
                              <span className="text-purple-300">• {lead.dept || lead.department || 'Engineering'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                            {lead.budget || lead.budgetRange || '₹15,000 - ₹30,000'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(leadId)}
                            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-slate-200 bg-black/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
                        {lead.description || lead.requirements || 'No extra requirements specified.'}
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Update Pipeline Progress:</span>
                          <span className="text-[11px] text-cyan-300 font-bold">
                            Current: {PIPELINE_STATUSES.find((s) => s.id === currentStatus)?.label || currentStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {PIPELINE_STATUSES.map((step) => {
                            const isCurrent = currentStatus === step.id;
                            return (
                              <button
                                key={step.id}
                                type="button"
                                onClick={() => handleUpdateStatus(leadId, step.id)}
                                className={`p-2 rounded-xl text-center font-mono text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                  isCurrent
                                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                                    : 'bg-gray-900/90 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isCurrent && <Check className="w-3 h-3" />}
                                <span>{step.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            <span>Private Admin Notes:</span>
                          </span>
                          {!isEditingThisNote && (
                            <button
                              onClick={() => {
                                setEditingNotesId(leadId);
                                setNoteText(lead.adminNotes || '');
                              }}
                              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                            >
                              {lead.adminNotes ? 'Edit Notes' : '+ Add Note'}
                            </button>
                          )}
                        </div>
                        {isEditingThisNote ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="e.g. Confirmed ₹25k scope on WhatsApp, advance received..."
                              className="w-full p-2.5 rounded-xl bg-black border border-cyan-500/40 text-white focus:outline-none text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingNotesId(null)} className="px-3 py-1 rounded-lg bg-gray-800 text-slate-400 text-[10px]">
                                Cancel
                              </button>
                              <button onClick={() => handleSaveNotes(leadId)} className="px-3.5 py-1 rounded-lg bg-cyan-500 text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                                <Save className="w-3 h-3" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        ) : lead.adminNotes ? (
                          <p className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30">
                            💬 {lead.adminNotes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-600 italic">No notes added yet.</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Alert Confirmed to <strong>theprojectxia@gmail.com</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          {clientPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${clientName}, this is ProjectXia Engineering regarding your custom project inquiry for "${lead.projectTitle || lead.dept || 'Engineering Build'}".`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-black font-display font-bold flex items-center gap-1.5 shadow-md"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat on WhatsApp</span>
                            </a>
                          )}
                          {clientPhone && (
                            <a href={`tel:${clientPhone}`} className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-slate-700 text-white font-bold flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Call Client</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'buyers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <span>Buyer Purchases & Project Sales Ledger</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Full details of students and companies who purchased engineering projects from ProjectXia.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                {buyerOrders.length} Paid Orders
              </span>
            </div>
            <div className="p-4 rounded-3xl bg-gray-950/90 border border-emerald-500/30 overflow-x-auto shadow-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Order Ref</th>
                    <th className="pb-3">Buyer Name & Contacts</th>
                    <th className="pb-3">Project Purchased</th>
                    <th className="pb-3">Price Paid</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">License Key</th>
                    <th className="pb-3 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {buyerOrders.map((order) => {
                    const cleanPhone = (order.buyerMobile || '').replace(/[^0-9]/g, '');
                    return (
                      <tr key={order.orderId} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            {order.orderId}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-white">{order.buyerName}</p>
                          <p className="text-[10px] text-cyan-300">{order.buyerEmail}</p>
                          <p className="text-[10px] text-slate-400">{order.buyerMobile}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-slate-200 line-clamp-1">{order.projectTitle}</p>
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Verified Access Active</span>
                        </td>
                        <td className="py-3.5 font-display font-black text-emerald-400 text-sm">
                          ₹{Number(order.amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 text-slate-300 text-[11px]">{order.paymentMethod}</td>
                        <td className="py-3.5 font-mono text-[10px] text-purple-300">{order.licenseKey}</td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${order.buyerName}, thank you for purchasing "${order.projectTitle}" on ProjectXia.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-[#00a884] text-black font-bold text-[10px] flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            {order.buyerMobile && (
                              <a
                                href={`tel:${order.buyerMobile}`}
                                className="p-1 rounded-lg bg-gray-900 border border-slate-700 text-white"
                              >
                                <Phone className="w-3 h-3 text-cyan-400" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-400" />
                  <span>Sellers & Listed Engineering Works</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Full list of verified creators, authors, asking prices, and listed code repositories.
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
                {projectsList.length} Active Works
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsList.map((proj) => {
                const pId = proj._id || proj.id;
                return (
                  <div
                    key={pId}
                    className="p-5 rounded-3xl bg-gray-950/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                          {proj.category || 'Computer Science'}
                        </span>
                        <span className="font-display font-black text-emerald-400 text-base">
                          ₹{proj.price ? Number(proj.price).toLocaleString() : '2,999'}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                        {proj.title || 'Engineering Project Repository'}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {proj.description || 'Full source code, circuit schematic, and documentation bundle.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Seller / Author:</span>
                        <strong className="text-slate-200">{proj.seller?.name || proj.author || 'Verified Creator'}</strong>
                        <span className="text-[10px] text-cyan-400 block">{proj.seller?.email || 'creator@projectxia.com'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/project/${pId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                          <span>Preview</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(pId)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Delete Work</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'plagiarism' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>AI Plagiarism & Code Integrity Scan History</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Logs of students and developers who scanned their source code or project documentation with ProjectXia AI Shield.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
                {plagiarismScans.length} Scans Run
              </span>
            </div>
            <div className="p-4 rounded-3xl bg-gray-950/90 border border-purple-500/30 overflow-x-auto shadow-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Scan Ref</th>
                    <th className="pb-3">User & Contact</th>
                    <th className="pb-3">File Scanned & Stack</th>
                    <th className="pb-3">Originality Score</th>
                    <th className="pb-3">Plagiarism %</th>
                    <th className="pb-3">IEEE Certificate</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {plagiarismScans.map((scan) => (
                    <tr key={scan.scanId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                          {scan.scanId}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-white">{scan.userName}</p>
                        <p className="text-[10px] text-purple-300">{scan.userEmail}</p>
                        <p className="text-[10px] text-slate-400">{scan.userMobile}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-slate-200">{scan.fileName}</p>
                        <span className="text-[10px] text-cyan-400">{scan.language} • {scan.linesOfCode || 200} Lines</span>
                      </td>
                      <td className="py-3.5 font-bold text-emerald-400 text-sm">
                        {scan.cleanCodeScore || 98}% Original
                      </td>
                      <td className="py-3.5 font-bold text-cyan-300">
                        {scan.plagiarismPercentage || 0.3}%
                      </td>
                      <td className="py-3.5 text-[11px] text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
                          {scan.ieeeGrade || 'A+ (Verified)'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-slate-400 text-[11px]">
                        {new Date(scan.verifiedAt || Date.now()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Platform Community & Login Activity Ledger</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Live record of registered accounts, login methods, IP network nodes, and 1-click quarantine.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full">
                {usersList.length} Active Accounts
              </span>
            </div>
            <div className="p-4 rounded-3xl bg-gray-950/90 border border-cyan-500/30 overflow-x-auto shadow-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">User & Profile</th>
                    <th className="pb-3">Role & Verification</th>
                    <th className="pb-3">Login Method</th>
                    <th className="pb-3">IP / Network Node</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {usersList.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}`}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover bg-gray-900"
                          />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-cyan-300 font-mono">{u.email}</p>
                            <p className="text-[10px] text-slate-400">{u.mobile || '+91 98451 00000'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-cyan-400 font-bold uppercase">{u.role}</span>
                        <p className="text-[10px] text-slate-400">{u.verificationLevel || 'Verified Innovator'}</p>
                      </td>
                      <td className="py-3.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-gray-900 border border-slate-800 text-[10px]">
                          {u.loginMethod || 'Email ID + Password'}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {u.ipAddress || '103.21.144.12 (India)'}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isBanned
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {u.isBanned ? 'QUARANTINED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleToggleBan(u._id || u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            u.isBanned
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900'
                          }`}
                        >
                          {u.isBanned ? 'Restore User' : 'Quarantine'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="max-w-2xl bg-gray-950/90 border border-cyan-500/30 p-6 sm:p-8 rounded-3xl space-y-4 font-mono text-xs shadow-2xl">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Broadcast System Announcement</h3>
              <p className="text-slate-400">
                Instantly broadcast an executive banner to all active clients, buyers, and creators browsing ProjectXia.
              </p>
            </div>
            {broadcastMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                ✓ {broadcastMsg}
              </div>
            )}
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  placeholder="e.g. Super Sprint 2026: Direct Verification Open"
                  className="w-full bg-black/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  placeholder="e.g. All engineering projects submitted today will receive priority IEEE plagiarism verification..."
                  className="w-full bg-black/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Announcement Now</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
