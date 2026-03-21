import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DownloadSimple, PaperPlaneTilt, ArrowCounterClockwise, Trash, Minus, Plus, Circle, Square, LineSegment, Eraser, Pencil } from '@phosphor-icons/react';
import { getSocket } from '@/lib/socket';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'brush', icon: Circle, label: 'Brush' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'line', icon: LineSegment, label: 'Line' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
];

const PALETTE = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#475569',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#1e293b', '#000000',
];

const CanvasDrawing = () => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);
  const remoteCursors = useRef({});
  const strokesRef = useRef([]);
  const currentStroke = useRef([]);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [canvasId, setCanvasId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);

  const { closeCanvas, activeCanvasId } = useUIStore();
  const { activeChat } = useChatStore();
  const { user } = useAuthStore();

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const resize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.putImageData(imageData, 0, 0);
      applyCanvasDefaults(ctx);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    applyCanvasDefaults(ctx);
    window.addEventListener('resize', resize);

    // Join socket canvas room
    const socket = getSocket();
    if (socket && activeChat) {
      socket.emit('canvas:join', { canvasId: activeCanvasId, chatId: activeChat._id }, (res) => {
        if (res?.success) {
          setCanvasId(res.canvasId);
          // Replay existing strokes
          res.strokes?.forEach((stroke) => drawStroke(ctx, stroke));
          setCollaborators(res.activeUsers || []);
        }
      });

      // Remote drawing events
      socket.on('canvas:draw_start', handleRemoteDrawStart);
      socket.on('canvas:draw_move', handleRemoteDrawMove);
      socket.on('canvas:draw_end', handleRemoteDrawEnd);
      socket.on('canvas:cursor', handleRemoteCursor);
      socket.on('canvas:undo', ({ strokes }) => redrawAll(ctx, strokes));
      socket.on('canvas:clear', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
      socket.on('canvas:user_joined', ({ userId, username }) => {
        setCollaborators((prev) => [...prev, { _id: userId, username }]);
      });
      socket.on('canvas:user_left', ({ userId }) => {
        setCollaborators((prev) => prev.filter((c) => c._id !== userId));
        delete remoteCursors.current[userId];
      });
    }

    return () => {
      window.removeEventListener('resize', resize);
      socket?.off('canvas:draw_start', handleRemoteDrawStart);
      socket?.off('canvas:draw_move', handleRemoteDrawMove);
      socket?.off('canvas:draw_end', handleRemoteDrawEnd);
      socket?.off('canvas:cursor', handleRemoteCursor);
      socket?.off('canvas:undo');
      socket?.off('canvas:clear');
      socket?.off('canvas:user_joined');
      socket?.off('canvas:user_left');
      if (canvasId) socket?.emit('canvas:leave', { canvasId });
    };
  }, []);

  const applyCanvasDefaults = (ctx) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
  };

  // Remote handlers (forward-declared as variables so cleanup works)
  function handleRemoteDrawStart({ userId, tool, color, size, opacity, point }) {
    remoteCursors.current[userId] = { x: point.x, y: point.y, tool, color, size, opacity, points: [point] };
  }
  function handleRemoteDrawMove({ userId, point }) {
    const cursor = remoteCursors.current[userId];
    if (!cursor) return;
    cursor.points.push(point);
    const ctx = ctxRef.current;
    drawLiveLine(ctx, cursor.color, cursor.size, cursor.opacity, cursor.tool,
      cursor.points[cursor.points.length - 2], point);
  }
  function handleRemoteDrawEnd({ userId }) {
    delete remoteCursors.current[userId];
  }
  function handleRemoteCursor({ userId, x, y }) {
    if (!remoteCursors.current[userId]) remoteCursors.current[userId] = {};
    remoteCursors.current[userId].x = x;
    remoteCursors.current[userId].y = y;
  }

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const drawLiveLine = (ctx, clr, sz, op, tl, from, to) => {
    if (!from || !to) return;
    ctx.globalAlpha = op;
    ctx.strokeStyle = tl === 'eraser' ? '#1a1a2e' : clr;
    ctx.lineWidth = tl === 'brush' ? sz * 2.5 : sz;
    ctx.globalCompositeOperation = tl === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points || stroke.points.length < 2) return;
    for (let i = 1; i < stroke.points.length; i++) {
      drawLiveLine(ctx, stroke.color, stroke.size, stroke.opacity, stroke.tool, stroke.points[i - 1], stroke.points[i]);
    }
  };

  const redrawAll = (ctx, strokes) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokes.forEach((s) => drawStroke(ctx, s));
    strokesRef.current = strokes;
  };

  // Mouse/Touch Events
  const onPointerDown = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const point = getPoint(e);
    startPoint.current = point;
    currentStroke.current = [point];
    snapshotRef.current = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

    getSocket()?.emit('canvas:draw_start', { canvasId, tool, color, size, opacity, point });
  };

  const onPointerMove = (e) => {
    e.preventDefault();
    const point = getPoint(e);
    // Emit cursor position always
    getSocket()?.emit('canvas:cursor', { canvasId, ...point });

    if (!isDrawing.current) return;
    currentStroke.current.push(point);

    const prev = currentStroke.current[currentStroke.current.length - 2];
    if (tool === 'line' || tool === 'rect') {
      // Restore snapshot and redraw shape preview
      ctxRef.current.putImageData(snapshotRef.current, 0, 0);
      drawShapePreview(ctxRef.current, tool, startPoint.current, point);
    } else {
      drawLiveLine(ctxRef.current, color, size, opacity, tool, prev, point);
    }

    getSocket()?.emit('canvas:draw_move', { canvasId, point });
  };

  const onPointerUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const stroke = { tool, color, size, opacity, points: currentStroke.current };
    strokesRef.current.push(stroke);
    getSocket()?.emit('canvas:draw_end', { canvasId, stroke });
    currentStroke.current = [];
  };

  const drawShapePreview = (ctx, tl, from, to) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    if (tl === 'line') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    } else if (tl === 'rect') {
      ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const handleUndo = () => {
    getSocket()?.emit('canvas:undo', { canvasId }, (res) => {
      if (res?.success) redrawAll(ctxRef.current, res.strokes || []);
    });
  };

  const handleClear = () => {
    if (!confirm('Clear the canvas?')) return;
    getSocket()?.emit('canvas:clear', { canvasId });
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.download = 'eminence-drawing.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleSendToChat = async () => {
    if (!activeChat || !canvasId) return;
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'));
      const formData = new FormData();
      formData.append('canvas', blob, 'drawing.png');

      const { data: uploadData } = await api.post('/api/upload/canvas', formData);
      getSocket()?.emit('canvas:send_to_chat', {
        canvasId, chatId: activeChat._id,
        imageUrl: uploadData.url, publicId: uploadData.publicId,
      });
      toast.success('Drawing sent to chat!');
      closeCanvas();
    } catch {
      toast.error('Failed to send drawing');
    }
  };

  return (
    <div className="w-full h-full bg-space-900 relative flex flex-col">
      {/* Toolbar */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/[0.06] border border-white/[0.1] rounded-2xl shadow-glass"
      >
        {/* Tools */}
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTool(id)}
            title={label}
            className={`p-2 rounded-xl transition-all ${tool === id ? 'bg-violet-600 text-white shadow-neon' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.07]'}`}
          >
            <Icon size={16} weight={tool === id ? 'fill' : 'regular'} />
          </motion.button>
        ))}

        <div className="w-px h-6 bg-white/[0.1] mx-1" />

        {/* Color palette */}
        <div className="flex gap-1 flex-wrap max-w-[120px]">
          {PALETTE.slice(0, 8).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Custom color */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent"
          title="Custom color"
        />

        <div className="w-px h-6 bg-white/[0.1] mx-1" />

        {/* Brush size */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSize(Math.max(1, size - 2))} className="text-white/50 hover:text-white transition-colors"><Minus size={12} /></button>
          <span className="text-white/60 text-xs w-5 text-center">{size}</span>
          <button onClick={() => setSize(Math.min(50, size + 2))} className="text-white/50 hover:text-white transition-colors"><Plus size={12} /></button>
        </div>

        <div className="w-px h-6 bg-white/[0.1] mx-1" />

        {/* Actions */}
        <button onClick={handleUndo} title="Undo" className="p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-all">
          <ArrowCounterClockwise size={15} weight="bold" />
        </button>
        <button onClick={handleClear} title="Clear" className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash size={15} weight="fill" />
        </button>
        <button onClick={handleExport} title="Download" className="p-2 rounded-xl text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
          <DownloadSimple size={15} weight="bold" />
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendToChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-neon"
        >
          <PaperPlaneTilt size={13} weight="fill" /> Send
        </motion.button>
        <button onClick={closeCanvas} className="p-2 rounded-xl text-white/40 hover:text-white transition-all">
          <X size={15} weight="bold" />
        </button>
      </motion.div>

      {/* Collaborators */}
      {collaborators.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 z-20 flex -space-x-2"
        >
          {collaborators.slice(0, 5).map((c, i) => (
            <div
              key={c._id || i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-space-900 flex items-center justify-center text-white text-xs font-bold"
              title={c.username}
            >
              {c.username?.[0]?.toUpperCase()}
            </div>
          ))}
        </motion.div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
    </div>
  );
};

export default CanvasDrawing;
