import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  Search,
  CheckCheck,
  Shield,
  Circle,
  FileCode,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Check,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  X,
  Trash2,
  UserCheck,
  Handshake,
  MessageSquarePlus,
  Filter,
  Phone,
  Video,
  Code,
  UploadCloud,
  LogOut,
  User as UserIcon,
  Plus,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

// ============================================================
// WHATSAPP VOICE NOTE PLAYER COMPONENT (EXACT WHATSAPP WEB STYLE)
// ============================================================
const WhatsAppVoicePlayer = ({ mediaUrl, audioDuration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!mediaUrl) return;
    const audio = new Audio(mediaUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [mediaUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // WhatsApp style amplitude bars
  const barCount = 20;
  const amplitudes = [35, 75, 40, 95, 60, 100, 45, 80, 55, 90, 35, 85, 65, 45, 90, 70, 50, 85, 40, 65];

  return (
    <div className="flex items-center gap-3 py-1 min-w-[210px] sm:min-w-[240px]">
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#00a884] text-black flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          onClick={handleSeek}
          className="flex items-center gap-0.5 h-6 cursor-pointer py-1"
          title="Click to seek audio"
        >
          {amplitudes.map((heightPercent, idx) => {
            const barProgress = (idx / barCount) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-colors ${
                  isPlayed ? 'bg-[#00a884]' : 'bg-[#8696a0]/40'
                }`}
                style={{ height: `${Math.max(20, heightPercent)}%` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#8696a0] font-mono">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration || audioDuration || 0)}</span>
          <span className="text-[#00a884] font-bold">🎤 Voice Note</span>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSound();
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Smart Scroll Management
  const chatContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

  // New Chat User Picker Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals & Panels
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const quickEmojis = ['😊', '👍', '❤️', '🔥', '🚀', '🙏', '💯', '⚡', '👏', '🎉'];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      shouldAutoScrollRef.current = true;
      fetchMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
        socket.emit('mark_read', { conversationId: activeConv._id, userId: user?._id || user?.id });
      }
      api.put(`/chat/messages/read/${activeConv._id}`).catch(() => {});
    }
  }, [activeConv]);

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        const exists = prev.some((m) => (m._id || m.id) === (msg._id || msg.id));
        if (exists) return prev;
        return [...prev, msg];
      });

      if (activeConv && msg.conversationId === activeConv._id) {
        socket.emit('mark_read', { conversationId: activeConv._id, userId: user?._id || user?.id });
      }

      playSuccess();
      if (shouldAutoScrollRef.current) {
        setTimeout(() => scrollToBottom(true), 100);
      }
    };

    const handleUserTyping = ({ userName, isTyping: typingState }) => {
      setIsTyping(typingState);
      setTypingUser(userName || 'Seller');
    };

    const handleMessagesRead = ({ conversationId }) => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, isRead: true }))
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeConv]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    shouldAutoScrollRef.current = isAtBottom;
    setShowScrollBottomButton(!isAtBottom);
  };

  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScrollRef.current) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      setShowScrollBottomButton(false);
    }
  };

  const getUserKey = () => {
    return (user?.email || user?._id || user?.id || 'guest').toLowerCase().trim();
  };

  const checkIsOnline = (p) => {
    if (!p || !Array.isArray(onlineUsers)) return false;
    const pId = String(p.userId || p.id || p._id || '').toLowerCase().trim();
    const pEmail = String(p.email || '').toLowerCase().trim();
    return onlineUsers.some((u) => {
      if (!u) return false;
      const strU = String(u).toLowerCase().trim();
      return (pId && strU === pId) || (pEmail && strU === pEmail);
    });
  };

  const getPartner = (conv) => {
    const defaultPartner = {
      userId: 'creator_seller',
      name: 'Project Creator',
      email: 'seller@projectxia.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Seller&backgroundColor=080e1e,101f4e&textColor=00f0ff',
      role: 'creator',
    };

    if (!conv || !Array.isArray(conv.participants) || conv.participants.length === 0) {
      return defaultPartner;
    }

    const myId = String(user?._id || user?.id || '').toLowerCase().trim();
    const myEmail = String(user?.email || '').toLowerCase().trim();

    let partner = conv.participants.find((p) => {
      if (!p) return false;
      const pId = String(p.userId || p.id || p._id || '').toLowerCase().trim();
      const pEmail = String(p.email || '').toLowerCase().trim();
      if (myId && (pId === myId || pEmail === myId)) return false;
      if (myEmail && (pEmail === myEmail || pId === myEmail)) return false;
      return true;
    });

    if (!partner) {
      partner = conv.participants[1] || conv.participants[0] || defaultPartner;
    }

    const name = partner?.name || partner?.userName || (partner?.email ? partner.email.split('@')[0] : 'Project Seller');
    const avatar = partner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=080e1e,101f4e&textColor=00f0ff`;

    return {
      ...partner,
      name,
      avatar,
    };
  };

  const fetchConversations = async () => {
    const userKey = getUserKey();
    let cachedConvs = [];

    try {
      const stored = localStorage.getItem(`px_convs_${userKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedConvs = parsed.filter((c) => c && c._id && !String(c._id).startsWith('conv_default_'));
        }
      }
    } catch (err) {}

    let apiConvs = [];
    try {
      const res = await api.get('/chat/conversations');
      apiConvs = res.data.conversations || [];
    } catch (e) {}

    const convMap = new Map();
    [...apiConvs, ...cachedConvs].forEach((c) => {
      if (c && c._id && !String(c._id).startsWith('conv_default_')) {
        convMap.set(String(c._id), c);
      }
    });

    let mergedConvs = Array.from(convMap.values());

    if (location.state?.creatorId || location.state?.conversationId) {
      const targetConvId = location.state.conversationId;
      const creatorId = location.state.creatorId;
      const creatorName = location.state.creatorName || 'Project Seller';
      const creatorEmail = location.state.creatorEmail || '';
      const creatorAvatar = location.state.creatorAvatar || '';

      let existing = mergedConvs.find((c) =>
        (targetConvId && c._id === targetConvId) ||
        (creatorId && c.participants?.some((p) => String(p.userId) === String(creatorId) || (creatorEmail && String(p.email).toLowerCase() === creatorEmail.toLowerCase())))
      );

      if (!existing) {
        existing = {
          _id: targetConvId || `conv_${Date.now()}`,
          participants: [
            {
              userId: user?._id || user?.id || 'user_guest',
              email: user?.email || '',
              name: user?.name || 'Verified User',
              avatar: user?.avatar,
              role: 'user',
            },
            {
              userId: creatorId || 'creator',
              email: creatorEmail,
              name: creatorName,
              avatar: creatorAvatar,
              role: 'creator',
            },
          ],
          projectContext: location.state.projectContext,
          lastMessage: {
            text: `Inquiring about ${location.state.projectContext?.title || 'project'}`,
            createdAt: new Date(),
          },
        };
        mergedConvs = [existing, ...mergedConvs];
      }

      setConversations(mergedConvs);
      setActiveConv(existing);
      fetchMessages(existing._id);
    } else {
      setConversations(mergedConvs);
      if (mergedConvs.length > 0 && !activeConv) {
        setActiveConv(mergedConvs[0]);
        fetchMessages(mergedConvs[0]._id);
      }
    }

    try {
      localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(mergedConvs));
    } catch (err) {}
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    const userKey = getUserKey();

    let cachedMsgs = [];
    try {
      const cached = localStorage.getItem(`px_msgs_${userKey}_${convId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) cachedMsgs = parsed;
      }
    } catch (err) {}

    try {
      const res = await api.get(`/chat/messages/${convId}`);
      const apiMsgs = res.data.messages || [];

      const msgMap = new Map();
      [...cachedMsgs, ...apiMsgs].forEach((m) => {
        const key = String(m._id || m.id);
        if (key) msgMap.set(key, m);
      });
      const mergedMsgs = Array.from(msgMap.values());

      setMessages(mergedMsgs);
      try { localStorage.setItem(`px_msgs_${userKey}_${convId}`, JSON.stringify(mergedMsgs)); } catch (e) {}
      setTimeout(() => scrollToBottom(true), 100);
    } catch (e) {
      setMessages(cachedMsgs);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  const handleOpenNewChatModal = async () => {
    playClick();
    setShowNewChatModal(true);
    setLoadingUsers(true);
    try {
      const res = await api.get('/chat/users');
      setAvailableUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch available users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChatWithUser = (targetUser) => {
    playClick();
    setShowNewChatModal(false);

    const currentUserId = String(user?._id || user?.id || 'user_guest');
    const currentUserEmail = String(user?.email || '').toLowerCase();
    const targetUserId = String(targetUser._id || targetUser.id);
    const targetEmail = String(targetUser.email || '').toLowerCase();

    let existing = conversations.find((c) =>
      c.participants?.some((p) => String(p.userId) === targetUserId || (targetEmail && String(p.email).toLowerCase() === targetEmail))
    );

    if (!existing) {
      existing = {
        _id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        participants: [
          {
            userId: currentUserId,
            email: currentUserEmail,
            name: user?.name || 'Verified User',
            avatar: user?.avatar || '',
            role: user?.role || 'user',
          },
          {
            userId: targetUserId,
            email: targetEmail,
            name: targetUser.name || 'Project Seller',
            avatar: targetUser.avatar || '',
            role: targetUser.role || 'creator',
          },
        ],
        lastMessage: {
          text: 'Started direct conversation',
          createdAt: new Date(),
        },
      };
      setConversations((prev) => [existing, ...prev]);
    }

    shouldAutoScrollRef.current = true;
    setActiveConv(existing);
    fetchMessages(existing._id);
  };

  useEffect(() => {
    if (activeConv && messages.length > 0) {
      const userKey = getUserKey();

      setConversations((prevConvs) => {
        const updated = prevConvs.map((c) => {
          if (c._id === activeConv._id) {
            return {
              ...c,
              lastMessage: {
                text: messages[messages.length - 1]?.text || c.lastMessage?.text || '',
                createdAt: new Date(),
              },
            };
          }
          return c;
        });
        try { localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  }, [activeConv?._id, messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputMsg.trim() && !attachmentFile) || !activeConv || isSending) return;
    playClick();
    setIsSending(true);

    const messageText = inputMsg;
    setInputMsg('');

    const currentUserId = String(user?._id || user?.id || 'user_guest');
    const currentUserEmail = String(user?.email || '').toLowerCase();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const otherParticipant = activeConv.participants?.find(
      (p) => String(p.userId) !== currentUserId && String(p.email || '').toLowerCase() !== currentUserEmail
    );

    const receiverId = otherParticipant?.userId || location.state?.creatorId || 'creator';
    const receiverName = otherParticipant?.name || location.state?.creatorName || 'Project Seller';
    const receiverEmail = otherParticipant?.email || location.state?.creatorEmail || '';
    const receiverAvatar = otherParticipant?.avatar || location.state?.creatorAvatar || '';

    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConv._id,
      sender: {
        id: currentUserId,
        email: currentUserEmail,
        name: user?.name || 'Verified User',
        avatar: user?.avatar || '',
      },
      receiverId,
      receiverName,
      receiverEmail,
      receiverAvatar,
      text: messageText,
      messageType: attachmentFile ? 'media' : 'text',
      mediaUrl: attachmentFile?.preview || null,
      fileName: attachmentFile?.name || null,
      projectData: activeConv.projectContext,
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    shouldAutoScrollRef.current = true;
    setTimeout(() => scrollToBottom(true), 50);

    const payload = {
      conversationId: activeConv._id,
      receiverId,
      receiverName,
      receiverEmail,
      receiverAvatar,
      text: messageText,
      messageType: optimisticMsg.messageType,
      mediaUrl: optimisticMsg.mediaUrl,
      fileName: optimisticMsg.fileName,
      projectData: activeConv.projectContext,
    };

    setAttachmentFile(null);
    setShowEmojiPicker(false);

    try {
      const res = await api.post('/chat/messages', payload);
      const newMsg = res.data.message || optimisticMsg;

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? newMsg : m))
      );

      if (res.data.conversation && res.data.conversation._id !== activeConv._id) {
        setActiveConv(res.data.conversation);
      }

      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          message: newMsg,
          receiverId,
          receiverEmail,
          senderEmail: currentUserEmail,
        });
      }
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================
  // WHATSAPP VOICE RECORDING ENGINE WITH THROTTLED SPECTRUM
  // ============================================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState([30, 60, 40, 80, 50, 90, 40, 70, 30, 60, 80, 40]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const cleanupAudioContext = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const startRecording = async () => {
    try {
      playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac'].find(
        (t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)
      ) || '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastUpdateTime = 0;
        const updateLevels = () => {
          if (analyserRef.current) {
            const now = Date.now();
            if (now - lastUpdateTime > 120) {
              lastUpdateTime = now;
              analyserRef.current.getByteFrequencyData(dataArray);
              const levels = Array.from(dataArray.slice(0, 12)).map((v) => Math.max(15, Math.min(100, (v / 255) * 100)));
              setAudioLevels(levels);
            }
            animFrameRef.current = requestAnimationFrame(updateLevels);
          }
        };
        updateLevels();
      } catch (audioErr) {}

      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission is required to record voice notes. Please allow microphone access in your browser settings.');
    }
  };

  const cancelRecording = () => {
    playClick();
    cleanupAudioContext();
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
    }
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    playClick();
    cleanupAudioContext();

    const recorder = mediaRecorderRef.current;
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    const duration = recordingTime > 0 ? recordingTime : 1;

    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const currentUserId = String(user?._id || user?.id || 'user_guest');
        const currentUserEmail = String(user?.email || '').toLowerCase();
        const tempId = `temp_voice_${Date.now()}`;

        const otherParticipant = activeConv.participants?.find(
          (p) => String(p.userId) !== currentUserId && String(p.email || '').toLowerCase() !== currentUserEmail
        );

        const receiverId = otherParticipant?.userId || location.state?.creatorId || 'creator';
        const receiverName = otherParticipant?.name || location.state?.creatorName || 'Project Seller';
        const receiverEmail = otherParticipant?.email || location.state?.creatorEmail || '';
        const receiverAvatar = otherParticipant?.avatar || location.state?.creatorAvatar || '';

        const optimisticMsg = {
          _id: tempId,
          conversationId: activeConv._id,
          sender: {
            id: currentUserId,
            email: currentUserEmail,
            name: user?.name || 'Verified User',
            avatar: user?.avatar || '',
          },
          receiverId,
          receiverName,
          receiverEmail,
          receiverAvatar,
          text: '',
          messageType: 'voice',
          mediaUrl: base64Audio,
          audioDuration: duration,
          projectData: activeConv.projectContext,
          isRead: false,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        shouldAutoScrollRef.current = true;
        setTimeout(() => scrollToBottom(true), 50);

        const payload = {
          conversationId: activeConv._id,
          receiverId,
          receiverName,
          receiverEmail,
          receiverAvatar,
          text: '',
          messageType: 'voice',
          mediaUrl: base64Audio,
          audioDuration: duration,
          projectData: activeConv.projectContext,
        };

        try {
          const res = await api.post('/chat/messages', payload);
          const newMsg = res.data.message || optimisticMsg;

          setMessages((prev) => prev.map((m) => (m._id === tempId ? newMsg : m)));

          if (socket) {
            socket.emit('send_message', {
              conversationId: activeConv._id,
              message: newMsg,
              receiverId,
              receiverEmail,
              senderEmail: currentUserEmail,
            });
          }
          playSuccess();
          setTimeout(() => scrollToBottom(true), 100);
        } catch (e) {
          console.error('Voice send error:', e);
        }
      };

      reader.readAsDataURL(audioBlob);

      if (recorder.stream) {
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachmentFile({ name: file.name, preview: evt.target.result, type: 'image' });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentFile({ name: file.name, preview: null, type: 'file' });
    }
  };

  const refreshChatHistory = () => {
    playClick();
    if (activeConv) {
      fetchMessages(activeConv._id);
    }
    setShowMenu(false);
  };

  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Permanently delete this chat conversation and all history?')) return;
    playClick();
    const userKey = getUserKey();
    try {
      await api.delete(`/chat/conversations/${convId}`);
      localStorage.removeItem(`px_msgs_${userKey}_${convId}`);

      setConversations((prev) => {
        const updated = prev.filter((c) => c._id !== convId);
        localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(updated));
        return updated;
      });

      if (activeConv?._id === convId) {
        setActiveConv(null);
        setMessages([]);
      }
      setShowMenu(false);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!c) return false;
    const p = getPartner(c);
    const pName = String(p?.name || 'Project Seller').toLowerCase();
    const q = String(searchQuery || '').toLowerCase();
    return pName.includes(q);
  });

  const filteredUsersForModal = availableUsers.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const partner = activeConv ? getPartner(activeConv) : getPartner(null);
  const isRecipientOnline = checkIsOnline(partner);

  return (
    <div className="fixed inset-0 z-40 w-screen h-screen bg-[#111b21] flex flex-col font-sans text-xs overflow-hidden">

      {/* WHATSAPP WEB GREEN ACCENT HEADER STRIP */}
      <div className="h-1 bg-[#00a884] shrink-0" />

      {/* WHATSAPP WEB INTEGRATED APP BAR */}
      <header className="bg-[#202c33] border-b border-[#202c33] px-4 py-2 flex items-center justify-between shrink-0 text-white z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 rounded-full bg-[#00a884] text-black font-black">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-display font-black text-sm tracking-tight">
              PROJECT<span className="text-[#00a884]">XIA</span>
            </span>
          </Link>
          <span className="text-[11px] text-[#8696a0] font-mono border-l border-[#374248] pl-3 hidden sm:inline">
            WhatsApp Web Engine • Realtime Encrypted Node
          </span>
        </div>

        {/* TOP NAV SHORTCUTS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/marketplace')}
            className="px-3 py-1.5 rounded-full bg-[#111b21] hover:bg-[#374248] text-[#e9edef] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#374248]/50"
          >
            <Code className="w-3.5 h-3.5 text-[#00a884]" />
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="px-3 py-1.5 rounded-full bg-[#111b21] hover:bg-[#374248] text-[#e9edef] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#374248]/50"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00a884]" />
            <span className="hidden sm:inline">Sell Code</span>
          </button>

          <button
            onClick={() => navigate('/ai-shield')}
            className="px-3 py-1.5 rounded-full bg-[#111b21] hover:bg-[#374248] text-[#e9edef] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#374248]/50"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Plagiarism Check</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="p-1.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-white transition-colors cursor-pointer"
            title="Profile"
          >
            <UserIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            title="Logout & Lock Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN WHATSAPP WEB FULL PAGE FRAME (0 MARGINS / 0 PADDING) */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">

        {/* ============================================================ */}
        {/* LEFT: WHATSAPP SIDEBAR (CHATS LIST) */}
        {/* ============================================================ */}
        <div className={`w-full md:w-[360px] lg:w-[420px] shrink-0 border-r border-[#202c33] flex flex-col h-full min-h-0 bg-[#111b21] ${activeConv ? 'hidden md:flex' : 'flex'}`}>

          {/* SIDEBAR HEADER */}
          <div className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#202c33]">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#00a884] bg-gray-900"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-[#e9edef] truncate max-w-[150px]">
                  {user?.name || 'Verified User'}
                </h3>
                <span className="text-[10px] text-[#00a884] font-mono block">online</span>
              </div>
            </div>

            {/* ACTION ICONS (NEW CHAT + MENU) */}
            <div className="flex items-center gap-1 text-[#8696a0]">
              <button
                type="button"
                onClick={handleOpenNewChatModal}
                className="p-2.5 rounded-full hover:bg-[#374248] hover:text-[#00a884] transition-colors cursor-pointer"
                title="Start New Direct Chat with User/Seller"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => fetchConversations()}
                className="p-2.5 rounded-full hover:bg-[#374248] hover:text-[#00a884] transition-colors cursor-pointer"
                title="Refresh Conversations"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SEARCH & FILTER CHIPS */}
          <div className="p-2.5 bg-[#111b21] border-b border-[#202c33] space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat..."
                className="w-full bg-[#202c33] border-none rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>

            {/* WHATSAPP FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
              {['All', 'Unread', 'Favorites', 'Groups'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884] font-bold'
                      : 'bg-[#202c33]/50 border-transparent text-[#8696a0] hover:bg-[#202c33] hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* CONVERSATIONS STREAM (TOUCH & SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/40 p-1.5 space-y-0.5 min-h-0 overscroll-contain">
            {filteredConversations.map((conv) => {
              const p = getPartner(conv);
              const isSelected = activeConv?._id === conv._id;
              const pOnline = checkIsOnline(p);

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    playClick();
                    setActiveConv(conv);
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group relative ${
                    isSelected
                      ? 'bg-[#2a3942] border border-[#00a884]/40 shadow-lg'
                      : 'hover:bg-[#202c33] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#00a884]/30 bg-gray-900"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#111b21] rounded-full ${pOnline ? 'bg-[#00a884]' : 'bg-[#8696a0]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-[#e9edef] truncate group-hover:text-[#00a884] transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[10px] text-[#8696a0] font-mono shrink-0">
                          {new Date(conv.lastMessage?.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#8696a0] truncate mt-0.5">
                        {conv.lastMessage?.text || 'Tap to chat'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="py-16 text-center text-[#8696a0] font-mono text-xs px-4 space-y-3">
                <MessageSquare className="w-10 h-10 mx-auto text-[#00a884]/60 animate-bounce" />
                <p className="text-[#e9edef] font-bold">No active conversations found.</p>
                <button
                  onClick={handleOpenNewChatModal}
                  className="px-4 py-2 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Start New Chat (+)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: ACTIVE CHAT MESSAGES WINDOW */}
        {/* ============================================================ */}
        <div className={`flex-1 flex flex-col h-full min-h-0 bg-[#0b141a] relative ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#202c33] relative z-20 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveConv(null)}
                    className="md:hidden px-2 py-1 rounded-xl bg-[#111b21] hover:bg-[#374248] text-[#00a884] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    ← Chats
                  </button>
                  <div className="relative">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884]"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#202c33] rounded-full ${isRecipientOnline ? 'bg-[#00a884] animate-pulse' : 'bg-[#8696a0]'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#e9edef]">
                      {partner.name}
                    </h3>
                    <p className="text-[10px] font-mono flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isRecipientOnline ? 'bg-[#00a884]' : 'bg-[#8696a0]'}`} />
                      <span className={isRecipientOnline ? 'text-[#00a884]' : 'text-[#8696a0]'}>
                        {isTyping ? `${typingUser} is typing...` : isRecipientOnline ? 'online' : 'offline'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* MENU & SEARCH */}
                <div className="flex items-center gap-1 text-[#8696a0]">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-white transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-11 w-48 bg-[#233138] border border-[#374248] rounded-2xl shadow-2xl py-2 z-50 text-xs font-mono text-[#e9edef] space-y-1">
                        <button
                          onClick={refreshChatHistory}
                          className="w-full px-4 py-2 text-left hover:bg-[#111b21] flex items-center gap-2 text-[#00a884] cursor-pointer font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sync Messages</span>
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(activeConv._id)}
                          className="w-full px-4 py-2 text-left hover:bg-[#111b21] flex items-center gap-2 text-rose-400 cursor-pointer font-bold border-t border-[#374248]/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MESSAGES CONTAINER WITH ABSOLUTE BOUNDED SCROLL VIEWPORT */}
              <div className="flex-1 relative w-full min-h-0 bg-[#0b141a] overflow-hidden">
                {/* STATIC WALLPAPER PATTERN LAYER */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 z-0"
                  style={{
                    backgroundImage: 'radial-gradient(#00a884 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* LIGHTWEIGHT ABSOLUTE BOUNDED NATIVE SCROLL STREAM */}
                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="absolute inset-0 w-full h-full overflow-y-scroll p-4 space-y-3 font-mono text-xs z-10 scrollbar-thin scrollbar-thumb-[#374248] scrollbar-track-transparent scroll-smooth"
                >
                  {/* DATE STAMP DIVIDER */}
                  <div className="flex items-center justify-center my-2">
                    <span className="bg-[#182229] text-[#8696a0] text-[10px] font-mono px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                      Today
                    </span>
                  </div>

                  {/* PINNED PROJECT INQUIRY BANNER */}
                  {activeConv.projectContext && (
                    <div className="p-3.5 rounded-2xl bg-[#1f2c34]/95 border border-[#00a884]/40 flex items-center justify-between text-xs shadow-lg backdrop-blur-md mb-3">
                      <div>
                        <span className="text-[10px] text-[#00a884] uppercase font-bold">Inquiring About Project:</span>
                        <p className="font-bold text-[#e9edef] font-display text-sm">{activeConv.projectContext.title}</p>
                      </div>
                      <span className="text-[#00a884] font-bold font-display text-base bg-[#00a884]/15 px-3 py-1 rounded-xl border border-[#00a884]/30">
                        ₹{Number(activeConv.projectContext.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* CHAT MESSAGES STREAM */}
                  {messages.map((msg) => {
                    const currentUid = String(user?._id || user?.id || 'user_001_buyer').trim();
                    const msgSenderId = String(msg.sender?.id || msg.sender?._id || '').trim();
                    const isMe = msgSenderId === currentUid || (user?.email && msg.sender?.email === user.email);

                    return (
                      <div
                        key={msg._id || msg.id || Math.random()}
                        className={`flex items-end gap-1.5 group relative ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl shadow-md relative ${
                            isMe
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#233138]'
                          }`}
                        >
                          {/* MEDIA / IMAGE ATTACHMENT */}
                          {msg.messageType === 'media' && msg.mediaUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden border border-black/30">
                              <img src={msg.mediaUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
                            </div>
                          )}

                          {/* NEGOTIATION DEAL OFFER CARD */}
                          {msg.messageType === 'deal_offer' || (msg.text && msg.text.includes('PROPOSED NEGOTIATION DEAL')) ? (
                            <div className="space-y-2.5 p-3.5 bg-[#111b21]/90 rounded-2xl border border-[#00a884]/50 shadow-inner my-1">
                              <div className="flex items-center gap-2 text-[#00a884] font-bold text-xs">
                                <Handshake className="w-4.5 h-4.5 shrink-0 text-[#00a884]" />
                                <span className="uppercase tracking-wider">PROPOSED NEGOTIATION DEAL</span>
                              </div>
                              <p className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap bg-[#1a2730] p-2.5 rounded-xl border border-[#263742]">
                                {msg.text}
                              </p>
                              {!isMe && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playSuccess();
                                      alert('🎉 Deal Offer Accepted! The agreed rate will be applied at checkout.');
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-[#00a884] text-black font-bold text-[11px] text-center hover:bg-[#02906f] transition-all cursor-pointer shadow-md"
                                  >
                                    Accept Deal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playClick();
                                      setInputMsg(`Counter Offer: I can offer ₹${Math.round((msg.projectData?.offerPrice || 2500) * 1.1)} for this project.`);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-[#202c33] text-slate-200 font-bold text-[11px] hover:text-white transition-all cursor-pointer border border-[#374248]"
                                  >
                                    Counter
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : msg.messageType === 'voice' ? (
                            <WhatsAppVoicePlayer
                              mediaUrl={msg.mediaUrl}
                              audioDuration={msg.audioDuration}
                              isMe={isMe}
                            />
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap text-xs">{msg.text}</p>
                          )}

                          {/* WHATSAPP READ RECEIPTS & TIMESTAMP */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                            <span>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Read by recipient (Double Blue Ticks)" />
                              ) : isRecipientOnline ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" title="Delivered to recipient (Double Grey Ticks)" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Sent (Single Grey Tick - Recipient Offline)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* REALTIME TYPING INDICATOR */}
                  {isTyping && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202c33]/80 w-fit text-[11px] text-[#00a884] font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#00a884]" />
                      <span>{typingUser} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* FLOATING SCROLL TO BOTTOM BUTTON */}
                {showScrollBottomButton && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      shouldAutoScrollRef.current = true;
                      scrollToBottom(true);
                    }}
                    className="absolute right-6 bottom-6 z-30 w-10 h-10 rounded-full bg-[#202c33] border border-[#374248] text-[#00a884] flex items-center justify-center shadow-2xl hover:bg-[#2a3942] transition-transform hover:scale-110 cursor-pointer"
                    title="Scroll to latest messages"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* ATTACHMENT PREVIEW STRIP */}
              {attachmentFile && (
                <div className="px-4 py-2 bg-[#111b21] border-t border-[#202c33] flex items-center justify-between text-xs shrink-0 relative z-20">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#00a884]" />
                    <span className="text-white truncate max-w-xs">{attachmentFile.name}</span>
                  </div>
                  <button
                    onClick={() => setAttachmentFile(null)}
                    className="p-1 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/40"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* QUICK EMOJI BAR */}
              {showEmojiPicker && (
                <div className="px-4 py-2 bg-[#111b21] border-t border-[#202c33] flex items-center gap-2 overflow-x-auto shrink-0 relative z-20">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputMsg((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#202c33] text-lg transition-transform hover:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* WHATSAPP INPUT BAR & ACTIVE RECORDING HUD */}
              {isRecording ? (
                <div className="p-3 bg-[#202c33] flex items-center justify-between gap-3 border-t border-[#202c33] relative z-20 shrink-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-colors cursor-pointer shrink-0"
                      title="Cancel Recording"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs shrink-0">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span>Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
                    </div>

                    {/* Animated Real-time Audio Frequency Waves */}
                    <div className="hidden sm:flex items-center gap-0.5 h-5 flex-1 max-w-xs px-2">
                      {audioLevels.map((lvl, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-rose-500/80 rounded-full transition-all duration-75"
                          style={{ height: `${lvl}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="px-4 py-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Voice Note</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-[#202c33] relative z-20 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Quick Emojis"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip,.py,.cpp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Attach Photo or Document"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isSending}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Record Voice Note"
                  >
                    <Mic className="w-5 h-5 text-[#00a884]" />
                  </button>

                  <input
                    type="text"
                    value={inputMsg}
                    disabled={isSending}
                    onChange={(e) => {
                      setInputMsg(e.target.value);
                      if (socket && activeConv) {
                        socket.emit('typing_start', {
                          conversationId: activeConv._id,
                          userName: user?.name,
                        });
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(
                          () => socket.emit('typing_stop', { conversationId: activeConv._id }),
                          2000
                        );
                      }
                    }}
                    placeholder="Type a direct message to seller..."
                    className="flex-1 bg-[#2a3942] border-none rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  />

                  <button
                    type="submit"
                    disabled={isSending || (!inputMsg.trim() && !attachmentFile)}
                    className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8696a0] font-mono text-xs space-y-4 p-6 text-center">
              <Shield className="w-16 h-16 text-[#00a884] animate-pulse" />
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-base text-[#e9edef]">ProjectXia Direct Chat</h3>
                <p className="text-xs text-[#8696a0]">
                  Send and receive end-to-end encrypted direct messages, voice notes, and project negotiation deals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewChatModal}
                className="px-5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Direct Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* NEW CHAT USER PICKER MODAL (START DIRECT CHAT WITH REAL USERS) */}
      {/* ============================================================ */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#111b21] border border-[#202c33] rounded-3xl p-5 text-[#e9edef] space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-[#202c33] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#00a884]/20 text-[#00a884]">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Start New Direct Chat</h3>
                  <p className="text-[11px] text-[#8696a0] font-mono">Select a registered seller or innovator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-full hover:bg-[#202c33] text-[#8696a0] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-[#202c33] border-none rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>

            {/* USERS LIST */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#202c33]/50 pr-1 space-y-1">
              {loadingUsers ? (
                <div className="py-8 text-center text-[#8696a0] text-xs font-mono">
                  Loading ProjectXia users...
                </div>
              ) : filteredUsersForModal.length > 0 ? (
                filteredUsersForModal.map((u) => (
                  <div
                    key={u._id || u.id}
                    onClick={() => handleStartChatWithUser(u)}
                    className="p-2.5 rounded-2xl hover:bg-[#202c33] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.email)}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#00a884]/40 bg-gray-900"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate group-hover:text-[#00a884]">
                          {u.name || u.email?.split('@')?.[0]}
                        </h4>
                        <p className="text-[10px] text-[#8696a0] font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2 py-0.5 rounded-full border border-[#00a884]/30 font-bold shrink-0">
                      Chat →
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#8696a0] text-xs font-mono">
                  No other users found. Start a project inquiry from any Marketplace project card!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;
