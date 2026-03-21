import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, Paperclip, Smiley, Microphone, X, Image, PenNib } from '@phosphor-icons/react';
import { gsap } from '@/animations/gsapConfig';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import { getSocket } from '@/lib/socket';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const MessageInput = ({ chatId }) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const inputRef = useRef(null);
  const sendBtnRef = useRef(null);
  const typingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { sendMessage } = useChatStore();
  const { replyingTo, clearReply, openCanvas } = useUIStore();

  // Auto-grow textarea
  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  // Typing indicator
  const emitTyping = useCallback((active) => {
    getSocket()?.emit(active ? 'typing:start' : 'typing:stop', { chatId });
  }, [chatId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    adjustHeight();
    // Debounced typing indicator
    emitTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(false), 2000);
  };

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    const msg = content.trim();
    setContent('');
    inputRef.current.style.height = 'auto';
    setIsSending(true);
    emitTyping(false);

    // Animate send button
    gsap.to(sendBtnRef.current, { scale: 0.7, duration: 0.1, yoyo: true, repeat: 1 });

    try {
      await sendMessage(chatId, msg, 'text', [], replyingTo?._id || null);
      clearReply();
    } catch {
      toast.error('Failed to send message');
      setContent(msg);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // File upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(0);
      const { data } = await api.post('/api/upload/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded / p.total) * 100)),
      });
      await sendMessage(chatId, '', data.type, [data], replyingTo?._id || null);
      clearReply();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadProgress(null);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');
        try {
          const { data } = await api.post('/api/upload/message', formData);
          await sendMessage(chatId, '', 'audio', [data]);
        } catch { toast.error('Failed to send voice message'); }
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-3">
      {/* Reply preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl border"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
              borderColor: 'rgba(var(--accent-rgb), 0.2)',
            }}
          >
            <div className="w-0.5 h-full rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{replyingTo.sender?.username}</span>
              <p className="text-white/50 text-xs truncate">{replyingTo.content || `[${replyingTo.type}]`}</p>
            </div>
            <button onClick={clearReply} className="text-white/30 hover:text-white/70 transition-colors">
              <X size={14} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      <AnimatePresence>
        {uploadProgress !== null && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="mb-2">
            <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: 'var(--accent)' }} initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-white/30 text-xs mt-0.5">Uploading... {uploadProgress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <label className="p-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/[0.07] cursor-pointer transition-all shrink-0">
          <Paperclip size={18} weight="bold" />
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,audio/*,.pdf" />
        </label>

        {/* Canvas button */}
        <button onClick={() => openCanvas(null)} className="p-2.5 rounded-xl text-white/40 btn-canvas-hover transition-all shrink-0">
          <PenNib size={18} weight="fill" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Message..."
            rows={1}
            className="w-full bg-white/[0.06] border border-white/[0.09] rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm resize-none focus:outline-none focus:bg-white/[0.08] transition-all duration-200 scrollbar-thin max-h-[140px] input-accent-focus"
            style={{ height: 'auto' }}
          />
        </div>

        {/* Voice / Send */}
        {content.trim() ? (
          <motion.button
            ref={sendBtnRef}
            onClick={handleSend}
            disabled={isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl text-white shrink-0 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, var(--accent), rgba(var(--accent-rgb), 0.7))`,
              boxShadow: `0 0 20px rgba(var(--accent-rgb), 0.45)`,
            }}
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </motion.button>
        ) : (
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-xl shrink-0 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.07]'}`}
          >
            <Microphone size={18} weight={isRecording ? 'fill' : 'regular'} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
