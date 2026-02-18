'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  LogOut, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  User, 
  Users, 
  Building2, 
  ChevronRight, 
  Leaf, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  FileText,
  Shield,
  PenTool,
  X,
  Loader2,
  Palmtree,
  Eye,
  Edit,
  ClipboardList,
  Settings,
  Home,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore, useAppStore, useDataStore, useUserMgmtStore, type GroundCheckTask, type TPHAttachment, type Division, type Foreman } from '@/store/auth-store';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Online/Offline detection hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const mountedRef = useRef(false);
  
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Set initial state synchronously on first render
      if (typeof navigator !== 'undefined') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOnline(navigator.onLine);
      }
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// Palm leaf SVG component
function PalmLeafDecoration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 5 C30 20, 10 50, 50 95 C90 50, 70 20, 50 5" opacity="0.1"/>
      <path d="M50 15 C35 25, 20 45, 50 85 C80 45, 65 25, 50 15" opacity="0.1"/>
    </svg>
  );
}

// Login Page Component
function LoginPage({ onLogin }: { onLogin: (user: { id: string; username: string; name: string; role: 'admin' | 'clerk' }) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Check and initialize database
    const initDb = async () => {
      try {
        const checkRes = await fetch('/api/init');
        const checkData = await checkRes.json();
        
        if (!checkData.initialized) {
          const initRes = await fetch('/api/init', { method: 'POST' });
          const initData = await initRes.json();
          if (initData.admin) {
            console.log('Admin created:', initData.admin.username);
          }
        }
      } catch (err) {
        console.error('Init error:', err);
      }
      setInitLoading(false);
    };
    
    initDb();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!isOnline) {
        // Offline login - check local storage
        const storedUsers = localStorage.getItem('sgs-users-storage');
        if (storedUsers) {
          const { state } = JSON.parse(storedUsers);
          const user = state?.users?.find((u: { username: string; password: string }) => 
            u.username === username && u.password === password
          );
          if (user) {
            onLogin({
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role,
            });
            return;
          }
        }
        setError('Offline: Username atau password salah');
        return;
      }
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative palm leaves */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="absolute -left-20 top-0 h-96 w-40 text-orange-500 rotate-45"
      >
        <PalmLeafDecoration />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="absolute -right-20 bottom-0 h-96 w-40 text-orange-500 -rotate-45"
      >
        <PalmLeafDecoration />
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-30"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), 
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) 
          }}
          animate={{
            y: [null, -100],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-orange-200">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <Palmtree className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                SGS
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                SPGE Groundcheck System
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Online/Offline indicator */}
            <div className="flex justify-center">
              <Badge variant={isOnline ? "default" : "secondary"} className={`gap-1 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-600">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                Masuk
              </Button>
            </form>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Default: admin / admin123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Camera Capture Dialog
function CameraCapture({ 
  isOpen, 
  onClose, 
  onCapture 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCapture: (imageData: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState('');

  // Stop camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasStream(true);
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      console.error('Camera error:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const currentStreamRef = streamRef;
    
    if (isOpen) {
      // Start camera when dialog opens
      const initCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          if (mounted) {
            streamRef.current = mediaStream;
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            setHasStream(true);
          }
        } catch (err) {
          if (mounted) {
            setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
            console.error('Camera error:', err);
          }
        }
      };
      initCamera();
    }
    
    return () => {
      mounted = false;
      // Stop camera on cleanup
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
      }
      setHasStream(false);
    };
  }, [isOpen]);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    stopCamera();
    setHasStream(false);
    onClose();
  }, [stopCamera, onClose]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        handleClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Camera className="w-5 h-5" />
            Ambil Foto TPH
          </DialogTitle>
          <DialogDescription>
            Arahkan kamera ke buah sawit dan tekan tombol capture
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={capturePhoto}
            disabled={!hasStream}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Signature Pad Component
function SignaturePad({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (signature: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const initRef = useRef(false);

  // Initialize canvas when dialog opens
  const initCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      initCanvas();
      initRef.current = true;
      // Use setTimeout to defer setState
      const timer = setTimeout(() => {
        setHasSignature(false);
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    } else {
      initRef.current = false;
    }
  }, [isOpen, initCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (canvasRef.current && hasSignature) {
      const signature = canvasRef.current.toDataURL('image/png');
      onSave(signature);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <PenTool className="w-5 h-5" />
            Tanda Tangan Digital
          </DialogTitle>
          <DialogDescription>
            Silakan tanda tangan di area bawah ini sebagai verifikasi
          </DialogDescription>
        </DialogHeader>
        
        <div className="border-2 border-orange-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={clearSignature}>
            Hapus
          </Button>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Simpan Tanda Tangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// TPH Attachment Card
function TPHAttachmentCard({
  attachment,
  index,
  onCapture,
  onRemove,
}: {
  attachment: TPHAttachment;
  index: number;
  onCapture: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-orange-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                {attachment.tphNumber}
              </span>
              TPH {attachment.tphNumber}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attachment.photoData ? (
            <div className="relative group">
              <img
                src={attachment.photoData}
                alt={`TPH ${attachment.tphNumber}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCapture}
                  className="bg-white/90"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ganti Foto
                </Button>
              </div>
              <Badge className="absolute bottom-2 right-2 bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Terekam
              </Badge>
            </div>
          ) : (
            <div
              onClick={onCapture}
              className="w-full h-48 border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <Camera className="w-12 h-12 text-orange-400 mb-2" />
              <span className="text-orange-600 font-medium">Tap untuk ambil foto</span>
              <span className="text-xs text-gray-500 mt-1">Kamera only (bukan galeri)</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Ground Check Panel
function GroundCheckPanel({
  user,
  onBack,
}: {
  user: { id: string; username: string; name: string; role: string };
  onBack: () => void;
}) {
  const { divisions, foremen } = useDataStore();
  const { savedTasks, addSavedTask } = useAppStore();
  
  const [clerkName, setClerkName] = useState(user.name);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedForeman, setSelectedForeman] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<TPHAttachment[]>([
    { id: generateId(), tphNumber: 1, photoData: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [currentTPHIndex, setCurrentTPHIndex] = useState(0);
  const [savedTask, setSavedTask] = useState<GroundCheckTask | null>(null);
  const [showSavedTasks, setShowSavedTasks] = useState(false);
  const isOnline = useOnlineStatus();

  const filteredForemen = selectedDivision
    ? foremen.filter(f => f.divisionId === selectedDivision)
    : [];

  const handleCapture = (index: number) => {
    setCurrentTPHIndex(index);
    setShowCamera(true);
  };

  const handlePhotoCapture = (imageData: string) => {
    setAttachments(prev => 
      prev.map((att, i) => 
        i === currentTPHIndex ? { ...att, photoData: imageData } : att
      )
    );
    setShowCamera(false);
  };

  const addTPHAttachment = () => {
    const newNumber = attachments.length + 1;
    setAttachments(prev => [...prev, { id: generateId(), tphNumber: newNumber, photoData: '' }]);
  };

  const removeTPHAttachment = (index: number) => {
    if (attachments.length > 1) {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!clerkName || !selectedDivision || !selectedForeman) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const photosTaken = attachments.filter(a => a.photoData).length;
    if (photosTaken === 0) {
      alert('Minimal harus ada 1 foto TPH yang diambil');
      return;
    }

    setSaving(true);
    
    const division = divisions.find(d => d.id === selectedDivision);
    const foreman = foremen.find(f => f.id === selectedForeman);
    
    const task: GroundCheckTask = {
      id: generateId(),
      clerkName,
      divisionId: selectedDivision,
      divisionCode: division?.code || '',
      foremanId: selectedForeman,
      foremanCode: foreman?.code || '',
      notes,
      status: 'saved',
      attachments: attachments.filter(a => a.photoData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      if (isOnline) {
        const res = await fetch('/api/groundcheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            createdBy: user.id,
          }),
        });
        
        const data = await res.json();
        if (data.success) {
          task.id = data.task.id;
        }
      }
      
      addSavedTask(task);
      setSavedTask(task);
      
      // Reset form
      setClerkName(user.name);
      setSelectedDivision('');
      setSelectedForeman('');
      setNotes('');
      setAttachments([{ id: generateId(), tphNumber: 1, photoData: '' }]);
      
      alert('Ground check berhasil disimpan!');
    } catch (err) {
      console.error('Save error:', err);
      // Save locally anyway
      addSavedTask(task);
      setSavedTask(task);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async (signature: string) => {
    if (!savedTask) return;
    
    const taskWithSignature = { ...savedTask, signature };
    
    try {
      // Call the PDF generation API
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithSignature),
      });
      
      if (res.ok) {
        // Get the PDF blob
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GroundCheck_${savedTask.divisionCode}_${savedTask.foremanCode}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback to HTML-based download if API fails
        const pdfContent = generatePDFContent(taskWithSignature, divisions, foremen);
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GroundCheck_${savedTask.divisionCode}_${savedTask.foremanCode}_${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF download error:', error);
      // Fallback to HTML-based download
      const pdfContent = generatePDFContent(taskWithSignature, divisions, foremen);
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GroundCheck_${savedTask.divisionCode}_${savedTask.foremanCode}_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-orange-600">
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Kembali
        </Button>
        <div className="flex gap-2">
          <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? 'bg-green-500' : 'bg-gray-500'}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSavedTasks(true)}
            className="border-orange-300"
          >
            <FileText className="w-4 h-4 mr-1" />
            Riwayat ({savedTasks.length})
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              QC Buah - Ground Check
            </CardTitle>
            <CardDescription className="text-orange-100">
              Formulir pemeriksaan kualitas buah sawit
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Clerk Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Nama Krani</Label>
                <Input
                  value={clerkName}
                  onChange={(e) => setClerkName(e.target.value)}
                  placeholder="Nama lengkap krani"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Divisi</Label>
                <Select value={selectedDivision} onValueChange={(value) => {
                  setSelectedDivision(value);
                  setSelectedForeman('');
                }}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        Divisi {d.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Kemandoran</Label>
                <Select 
                  value={selectedForeman} 
                  onValueChange={setSelectedForeman}
                  disabled={!selectedDivision}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
                    <SelectValue placeholder="Pilih Kemandoran" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredForemen.map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        Kemandoran {f.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator className="bg-orange-200" />
            
            {/* TPH Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium text-lg">Attachment TPH</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTPHAttachment}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah TPH
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {attachments.map((attachment, index) => (
                    <TPHAttachmentCard
                      key={attachment.id}
                      attachment={attachment}
                      index={index}
                      onCapture={() => handleCapture(index)}
                      onRemove={() => removeTPHAttachment(index)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <Separator className="bg-orange-200" />
            
            {/* Notes Section */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Catatan (NB) - Nama Pemanen Buah Mentah
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan nama-nama pemanen buah mentah di sini..."
                className="min-h-[100px] border-orange-200 focus:border-orange-500"
              />
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="border-orange-300"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Camera Dialog */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
      />
      
      {/* Signature Dialog */}
      <SignaturePad
        isOpen={showSignature}
        onClose={() => setShowSignature(false)}
        onSave={handleDownloadPDF}
      />
      
      {/* Saved Tasks Dialog */}
      <Dialog open={showSavedTasks} onOpenChange={setShowSavedTasks}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-orange-600">Riwayat Ground Check</DialogTitle>
            <DialogDescription>
              Daftar ground check yang telah disimpan
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px]">
            {savedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada data ground check tersimpan
              </div>
            ) : (
              <div className="space-y-4">
                {savedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              Divisi {task.divisionCode} - Kemandoran {task.foremanCode}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Krani: {task.clerkName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(task.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500">
                              {task.attachments.length} TPH
                            </Badge>
                            {isOnline && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSavedTask(task);
                                  setShowSignature(true);
                                }}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Generate PDF Content (simplified - in real app use jspdf or similar)
function generatePDFContent(
  task: GroundCheckTask, 
  divisions: Division[], 
  foremen: Foreman[]
): string {
  const division = divisions.find(d => d.id === task.divisionId);
  const foreman = foremen.find(f => f.id === task.foremanId);
  
  // This is a simplified HTML-based PDF generation
  // In production, use jspdf or pdfmake library
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Ground Check</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #f97316; }
    .title { font-size: 18px; margin-top: 10px; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #666; }
    .value { margin-left: 10px; }
    .photos { display: flex; flex-wrap: wrap; gap: 10px; }
    .photo { width: 150px; height: 150px; object-fit: cover; border: 1px solid #ddd; }
    .signature { margin-top: 50px; text-align: center; }
    .signature-img { max-width: 200px; max-height: 100px; }
    .signature-line { border-top: 1px solid #000; width: 200px; margin: 10px auto; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SGS - SPGE Groundcheck System</div>
    <div class="title">Laporan Ground Check - QC Buah</div>
  </div>
  
  <div class="section">
    <p><span class="label">Tanggal:</span><span class="value">${new Date(task.createdAt).toLocaleString('id-ID')}</span></p>
    <p><span class="label">Nama Krani:</span><span class="value">${task.clerkName}</span></p>
    <p><span class="label">Divisi:</span><span class="value">${division?.name || task.divisionCode}</span></p>
    <p><span class="label">Kemandoran:</span><span class="value">${foreman?.name || task.foremanCode}</span></p>
  </div>
  
  <div class="section">
    <h3>Dokumentasi TPH</h3>
    <div class="photos">
      ${task.attachments.map(att => `
        <div>
          <p>TPH ${att.tphNumber}</p>
          <img src="${att.photoData}" class="photo" alt="TPH ${att.tphNumber}" />
        </div>
      `).join('')}
    </div>
  </div>
  
  ${task.notes ? `
  <div class="section">
    <h3>Catatan (NB)</h3>
    <p>${task.notes}</p>
  </div>
  ` : ''}
  
  ${task.signature ? `
  <div class="signature">
    <h3>Tanda Tangan</h3>
    <img src="${task.signature}" class="signature-img" alt="Tanda Tangan" />
    <div class="signature-line"></div>
    <p>${task.clerkName}</p>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Dibuat secara digital melalui SGS - SPGE Groundcheck System</p>
    <p>© ${new Date().getFullYear()} SPGE</p>
  </div>
</body>
</html>
  `;
  
  return html;
}

// Admin Panel Component
function AdminPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('users');
  const { users, addUser, updateUser, deleteUser, setUsers } = useUserMgmtStore();
  const { divisions, addDivision, setDivisions } = useDataStore();
  const [loading, setLoading] = useState(false);
  
  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'clerk' as 'admin' | 'clerk',
    divisionId: '',
  });
  
  // New division form
  const [newDivision, setNewDivision] = useState({
    code: '',
    name: '',
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, divisionsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/divisions'),
        ]);
        
        const usersData = await usersRes.json();
        const divisionsData = await divisionsRes.json();
        
        if (usersData.success) setUsers(usersData.users);
        if (divisionsData.success) setDivisions(divisionsData.divisions);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    
    fetchData();
  }, [setUsers, setDivisions]);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('Mohon lengkapi semua field');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      const data = await res.json();
      if (data.success) {
        addUser({
          id: data.user.id,
          username: data.user.username,
          password: newUser.password,
          name: data.user.name,
          role: data.user.role,
          divisionId: data.user.divisionId,
        });
        setNewUser({ username: '', password: '', name: '', role: 'clerk', divisionId: '' });
        alert('Pengguna berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menambahkan pengguna');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return;
    
    try {
      await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      deleteUser(userId);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAddDivision = async () => {
    if (!newDivision.code || !newDivision.name) {
      alert('Mohon lengkapi semua field');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDivision),
      });
      
      const data = await res.json();
      if (data.success) {
        addDivision(data.division);
        setNewDivision({ code: '', name: '' });
        alert('Divisi berhasil ditambahkan');
      } else {
        alert(data.message || 'Gagal menambahkan divisi');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-orange-600">
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Kembali
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Panel Admin
            </CardTitle>
            <CardDescription className="text-orange-100">
              Kelola pengguna, divisi, dan kemandoran
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-orange-50 rounded-none border-b border-orange-200">
                <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                  <Users className="w-4 h-4 mr-2" />
                  Pengguna
                </TabsTrigger>
                <TabsTrigger value="divisions" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  Divisi
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="p-6">
                {/* Add User Form */}
                <Card className="mb-6 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-600">Tambah Pengguna Baru</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          placeholder="Username"
                          className="border-orange-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Password"
                          className="border-orange-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Nama lengkap"
                          className="border-orange-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: 'admin' | 'clerk') => 
                            setNewUser({ ...newUser, role: value })
                          }
                        >
                          <SelectTrigger className="border-orange-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clerk">Krani</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Divisi (Opsional)</Label>
                        <Select
                          value={newUser.divisionId}
                          onValueChange={(value) => setNewUser({ ...newUser, divisionId: value })}
                        >
                          <SelectTrigger className="border-orange-200">
                            <SelectValue placeholder="Pilih divisi" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleAddUser}
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Tambah Pengguna
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Users List */}
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {users.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Admin' : 'Krani'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="divisions" className="p-6">
                {/* Add Division Form */}
                <Card className="mb-6 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-600">Tambah Divisi Baru</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Kode Divisi</Label>
                        <Input
                          value={newDivision.code}
                          onChange={(e) => setNewDivision({ ...newDivision, code: e.target.value })}
                          placeholder="Contoh: 4"
                          className="border-orange-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nama Divisi</Label>
                        <Input
                          value={newDivision.name}
                          onChange={(e) => setNewDivision({ ...newDivision, name: e.target.value })}
                          placeholder="Contoh: Divisi 4"
                          className="border-orange-200"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleAddDivision}
                          disabled={loading}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                          Tambah Divisi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Divisions List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {divisions.map((division, index) => (
                    <motion.div
                      key={division.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-orange-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold mb-2">
                                {division.code}
                              </div>
                              <p className="font-medium">{division.name}</p>
                            </div>
                            <Badge variant="outline" className="border-orange-300 text-orange-600">
                              Aktif
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main Dashboard Component
function MainDashboard({
  user,
  onLogout,
  onSelectPanel,
}: {
  user: { id: string; username: string; name: string; role: string };
  onLogout: () => void;
  onSelectPanel: (panel: 'groundcheck' | 'agronomy' | 'qa' | 'admin') => void;
}) {
  const isOnline = useOnlineStatus();

  const panels = [
    {
      id: 'groundcheck',
      title: 'Ground Check',
      subtitle: 'QC Buah',
      description: 'Pemeriksaan kualitas buah sawit di lapangan',
      icon: Leaf,
      color: 'from-orange-500 to-orange-600',
      available: true,
    },
    {
      id: 'agronomy',
      title: 'Agronomy',
      subtitle: 'Agronomi',
      description: 'Pemantauan agronomi kebun',
      icon: Palmtree,
      color: 'from-green-500 to-green-600',
      available: false,
    },
    {
      id: 'qa',
      title: 'Quality Assurance',
      subtitle: 'Jaminan Kualitas',
      description: 'Pengendalian mutu produksi',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      available: false,
    },
  ];

  if (user.role === 'admin') {
    panels.push({
      id: 'admin',
      title: 'Admin Panel',
      subtitle: 'Administrasi',
      description: 'Kelola pengguna dan divisi',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      available: true,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.1, x: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute -left-40 top-20 h-[500px] w-[200px] text-orange-500 rotate-45"
      >
        <PalmLeafDecoration />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.1, x: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute -right-40 bottom-20 h-[500px] w-[200px] text-orange-500 -rotate-45"
      >
        <PalmLeafDecoration />
      </motion.div>
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-orange-200 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md"
            >
              <Palmtree className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                SGS
              </h1>
              <p className="text-xs text-gray-500">SPGE Groundcheck System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={isOnline ? "default" : "secondary"} className={`gap-1 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang, {user.name}!
          </h2>
          <p className="text-gray-600">
            Pilih panel untuk memulai pekerjaan Anda
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {panels.map((panel, index) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ scale: panel.available ? 1.02 : 1 }}
              whileTap={{ scale: panel.available ? 0.98 : 1 }}
              className={`relative ${!panel.available ? 'opacity-60' : 'cursor-pointer'}`}
              onClick={() => panel.available && onSelectPanel(panel.id as 'groundcheck' | 'agronomy' | 'qa' | 'admin')}
            >
              <Card className={`h-full border-0 shadow-lg overflow-hidden ${!panel.available ? 'bg-gray-100' : ''}`}>
                <div className={`h-2 bg-gradient-to-r ${panel.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${panel.color} rounded-lg flex items-center justify-center shadow-md`}>
                      <panel.icon className="w-6 h-6 text-white" />
                    </div>
                    {!panel.available && (
                      <Badge variant="secondary" className="text-xs">
                        Segera
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {panel.title}
                  </h3>
                  <p className="text-sm text-orange-600 font-medium mb-2">
                    {panel.subtitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {panel.description}
                  </p>
                  
                  {panel.available && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="mt-4 flex items-center text-orange-600 text-sm font-medium"
                    >
                      <span>Buka Panel</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} SPGE Groundcheck System</p>
        <p className="text-xs mt-1">Sistem Pemeriksaan Kualitas Kelapa Sawit</p>
      </footer>
    </div>
  );
}

// Placeholder panels for Agronomy and QA
function PlaceholderPanel({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-orange-600">
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
        Kembali
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-200">
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Modul Dalam Pengembangan
            </h3>
            <p className="text-gray-500">
              Fitur ini akan segera tersedia dalam pembaruan mendatang
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main App Component
export default function SGSApp() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [currentPanel, setCurrentPanel] = useState<'dashboard' | 'groundcheck' | 'agronomy' | 'qa' | 'admin'>('dashboard');
  const isOnline = useOnlineStatus();
  
  // Update online status in store
  useEffect(() => {
    useAuthStore.getState().setOnline(isOnline);
  }, [isOnline]);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={(u) => {
      login(u);
      setCurrentPanel('dashboard');
    }} />;
  }

  // Handle logout
  const handleLogout = () => {
    logout();
    setCurrentPanel('dashboard');
  };

  // Render current panel
  const renderPanel = () => {
    switch (currentPanel) {
      case 'groundcheck':
        return (
          <GroundCheckPanel
            user={user!}
            onBack={() => setCurrentPanel('dashboard')}
          />
        );
      case 'agronomy':
        return (
          <PlaceholderPanel
            title="Agronomy"
            subtitle="Pemantauan Agronomi"
            onBack={() => setCurrentPanel('dashboard')}
          />
        );
      case 'qa':
        return (
          <PlaceholderPanel
            title="Quality Assurance"
            subtitle="Jaminan Kualitas"
            onBack={() => setCurrentPanel('dashboard')}
          />
        );
      case 'admin':
        return <AdminPanel onBack={() => setCurrentPanel('dashboard')} />;
      default:
        return (
          <MainDashboard
            user={user!}
            onLogout={handleLogout}
            onSelectPanel={setCurrentPanel}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPanel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        {currentPanel !== 'dashboard' && (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-8">
            {renderPanel()}
          </div>
        )}
        {currentPanel === 'dashboard' && renderPanel()}
      </motion.div>
    </AnimatePresence>
  );
}
