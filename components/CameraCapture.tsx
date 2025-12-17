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
        setError("Não foi possível iniciar o vídeo. A interação do usuário pode ser necessária.");
      });
      setIsStreamLoading(false);
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

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    } catch (err) {
      lastError = err as Error;
      if (err instanceof Error && (err.name === "OverconstrainedError" || err.name === "NotFoundError")) {
        console.log("Câmera traseira falhou, tentando qualquer câmera disponível...");
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          lastError = null; 
        } catch (fallbackErr) {
          lastError = fallbackErr as Error;
        }
      }
    }
    
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } else {
      let errorMessage = "Câmera não disponível. Verifique as permissões.";
      if (lastError) {
          if (lastError.name === "NotAllowedError" || lastError.name === "PermissionDeniedError") {
              errorMessage = "Permissão da câmera negada. Habilite nas configurações do seu navegador.";
          } else if (lastError.name === "NotFoundError" || lastError.name === "DevicesNotFoundError") {
              errorMessage = "Nenhuma câmera encontrada no dispositivo.";
          }
      }
      setError(errorMessage);
      stopCamera();
    }
  }, [isCameraOn, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < video.HAVE_METADATA || video.videoWidth === 0) {
      setError("A câmera ainda não está pronta. Por favor, aguarde.");
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
    <div className="mb-4 p-4 border border-brand-steel rounded-lg bg-brand-slate text-center">
      <h4 className="text-lg font-semibold mb-2 text-brand-text">{title}</h4>
      {error && <p className="text-feedback-error mb-2 text-sm text-center bg-red-900/50 p-2 rounded-md">{error}</p>}
      
      <div className="w-full max-w-sm mx-auto bg-black rounded-md overflow-hidden mb-2 relative aspect-video flex items-center justify-center">
        {isCameraOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-auto transition-opacity duration-300 ${isStreamLoading ? 'opacity-0' : 'opacity-100'}`} />
            {isStreamLoading && <div className="absolute text-white animate-pulse">Iniciando câmera...</div>}
          </>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captura" className="w-full h-auto object-cover" />
        ) : (
          <div className="text-brand-text-muted flex flex-col items-center">
            <CameraIcon className="w-12 h-12" />
            <p>Câmera desligada</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {isCameraOn ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={handleCapture} disabled={isStreamLoading} className="w-full bg-brand-amber hover:bg-opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors disabled:bg-brand-slate disabled:cursor-not-allowed">
              <CameraIcon className="w-5 h-5 mr-2" />
              {isStreamLoading ? 'Aguarde...' : 'Tirar Foto'}
            </button>
            <button type="button" onClick={stopCamera} className="w-full sm:w-auto bg-brand-steel hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors">
                <XCircleIcon className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Cancelar</span>
            </button>
          </div>
        ) : capturedImage ? (
          <button type="button" onClick={handleRetake} className="w-full bg-brand-steel hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors">
            <CameraIcon className="w-5 h-5 mr-2" />
            Alterar Foto
          </button>
        ) : (
          <button type="button" onClick={startCamera} className="w-full bg-brand-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors">
            <CameraIcon className="w-5 h-5 mr-2" />
            Capturar Foto
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
