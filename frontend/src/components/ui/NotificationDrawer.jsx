import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Shield, MessageSquare, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSound } from '../../context/SoundContext';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playClick } = useSound();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sliding Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-gray-950/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Shield Intel Center</h2>
                  <p className="text-xs font-mono text-cyan-400">Real-Time Platform Alerts</p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="py-20 text-center text-cyan-400 font-mono text-sm">
                  Connecting to Shield Telemetry...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-mono text-sm">
                  All systems clean. Zero security alerts.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => markAsRead(notif._id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-gray-900/40 border-slate-800 text-slate-400'
                        : 'bg-cyan-950/30 border-cyan-500/40 text-slate-200 shadow-lg shadow-cyan-950/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                        {notif.type === 'security_shield' ? (
                          <Shield className="w-4 h-4 text-emerald-400" />
                        ) : notif.type === 'message' ? (
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-fuchsia-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-white">{notif.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500">Live</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                        
                        {notif.actionUrl && (
                          <Link
                            to={notif.actionUrl}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                          >
                            <span>Inspect Action</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/20 bg-gray-900/40 text-center">
              <span className="text-[11px] font-mono text-slate-400">
                ProjectXia Anti-Fraud Gateway Active • India Node
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationDrawer;
