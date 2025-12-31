
import React, { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
      }
    };

    const detect = async () => {
      if (!videoRef.current) return;
      
      // Attempt to use native BarcodeDetector if supported
      // @ts-ignore
      if ('BarcodeDetector' in window) {
        try {
          // @ts-ignore
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            onScan(barcodes[0].rawValue);
            return;
          }
        } catch (e) {}
      }
      animationId = requestAnimationFrame(detect);
    };

    startCamera().then(() => {
        setTimeout(detect, 1000);
    });

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-4 border-indigo-500">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center bg-slate-900">
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-indigo-400 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse"></div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-8 text-center text-white">
        <h3 className="text-xl font-black mb-2">Đang tìm mã QR...</h3>
        <p className="text-slate-400 text-sm mb-6">Đưa mã QR trên hóa đơn vào khung quét</p>
        <button onClick={onClose} className="px-8 py-3 bg-rose-600 rounded-2xl font-black shadow-lg">Hủy bỏ</button>
      </div>
    </div>
  );
};

export default QRScanner;
