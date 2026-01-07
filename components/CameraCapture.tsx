
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, XCircleIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  title: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [resInfo, setResInfo] = useState<string>("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsStreamLoading(false);
  }, []);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isCameraOn) return;

    const handleLoadedMetadata = () => {
      videoElement.play().catch(err => {
        console.error("Video play failed:", err);
        setError("Não foi possível iniciar o vídeo.");
      });
      setIsStreamLoading(false);
      setResInfo(`${videoElement.videoWidth}x${videoElement.videoHeight}`);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isCameraOn]);

  const startCamera = useCallback(async () => {
    if (isCameraOn) return;
    
    setCapturedImage(null);
    setError(null);
    setIsCameraOn(true);
    setIsStreamLoading(true);

    let stream: MediaStream | null = null;
    let lastError: Error | null = null;

    // Reduzido para Full HD (1080p) - Equilíbrio entre nitidez e peso de rede
    const optimalConstraints = { 
      video: { 
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920, min: 1280 }, 
        height: { ideal: 1080, min: 720 }
      } 
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(optimalConstraints);
    } catch (err) {
      lastError = err as Error;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        lastError = null; 
      } catch (fallbackErr) {
        lastError = fallbackErr as Error;
      }
    }
    
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } else {
      setError("Câmera não disponível ou permissão negada.");
      stopCamera();
    }
  }, [isCameraOn, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < video.HAVE_METADATA || video.videoWidth === 0) {
      setError("A câmera não está pronta.");
      return;
    }
    
    // Mantemos a proporção nativa para não distorcer o documento
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { alpha: false });
    
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Qualidade 0.8 (reduz 90% do tamanho do arquivo mantendo 95% da nitidez)
      // Ideal para uploads em redes móveis (3G/4G)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      onCapture(imageDataUrl);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="mb-4 p-4 border border-brand-steel rounded-2xl bg-brand-charcoal/50 text-center">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">{title}</h4>
        {isCameraOn && resInfo && <span className="text-[8px] text-brand-amber font-mono bg-brand-amber/10 px-2 py-0.5 rounded">{resInfo}</span>}
      </div>
      
      {error && <p className="text-feedback-error mb-2 text-[10px] font-bold uppercase">{error}</p>}
      
      <div className="w-full mx-auto bg-black rounded-xl overflow-hidden mb-3 relative aspect-video flex items-center justify-center border border-brand-steel group">
        {isCameraOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${isStreamLoading ? 'opacity-0' : 'opacity-100'}`} />
            {isStreamLoading && <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal text-[9px] text-brand-amber font-black animate-pulse uppercase tracking-widest">Ajustando foco...</div>}
            <div className="absolute inset-4 border border-white/20 pointer-events-none rounded-lg"></div>
          </>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captura" className="w-full h-full object-cover" />
        ) : (
          <div className="text-brand-text-muted flex flex-col items-center opacity-30 group-hover:opacity-50 transition-opacity">
            <CameraIcon className="w-10 h-10 mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest">Lente Bloqueada</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {isCameraOn ? (
          <div className="flex gap-2">
            <button type="button" onClick={handleCapture} disabled={isStreamLoading} className="flex-1 bg-brand-amber hover:scale-[1.02] text-brand-charcoal font-black py-3 rounded-xl inline-flex items-center justify-center transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-lg">
              <CameraIcon className="w-4 h-4 mr-2" />
              Bater Foto
            </button>
            <button type="button" onClick={stopCamera} className="px-4 bg-brand-steel text-white font-black py-3 rounded-xl text-[10px] uppercase">
              X
            </button>
          </div>
        ) : capturedImage ? (
          <button type="button" onClick={handleRetake} className="w-full bg-brand-steel border border-brand-slate text-brand-text font-black py-3 rounded-xl inline-flex items-center justify-center transition-all text-[10px] uppercase tracking-widest">
            <CameraIcon className="w-4 h-4 mr-2" />
            Alterar Foto
          </button>
        ) : (
          <button type="button" onClick={startCamera} className="w-full bg-brand-steel hover:bg-brand-slate text-white font-black py-3 rounded-xl inline-flex items-center justify-center transition-all text-[10px] uppercase tracking-widest">
            <CameraIcon className="w-4 h-4 mr-2" />
            Abrir Câmera
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
