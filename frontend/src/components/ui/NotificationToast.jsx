import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useSound } from '../../context/SoundContext';

const NotificationToast = () => {
  const navigate = useNavigate();
  const { realtimeNotification, clearRealtimeNotification } = useSocket();
  const { playSuccess, playClick } = useSound();

  useEffect(() => {
    if (realtimeNotification) {
      playSuccess();
    }
  }, [realtimeNotification]);

  if (!realtimeNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-4 z-50 max-w-sm w-full bg-[#111b21] border-2 border-[#00a884] rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-xs font-mono text-[#e9edef] space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 shrink-0 animate-pulse">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider block">
                WhatsApp Chat Alert
              </span>
              <h4 className="font-display font-bold text-sm text-white truncate max-w-[200px]">
                {realtimeNotification.title || 'New Message Received'}
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              clearRealtimeNotification();
            }}
            className="p-1 rounded-lg hover:bg-[#202c33] text-[#8696a0] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 font-sans text-xs line-clamp-2 bg-[#202c33]/60 p-2.5 rounded-xl border border-[#202c33]">
          "{realtimeNotification.message || 'Sent an attachment'}"
        </p>

        <button
          onClick={() => {
            playClick();
            clearRealtimeNotification();
            navigate('/chat');
          }}
          className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-black font-display font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>Open Direct WhatsApp Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationToast;
