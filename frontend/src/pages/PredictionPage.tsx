import React, { useState, useRef } from 'react';
import api, { API_BASE_URL } from '../services/api';
import PredictionCanvas from '../components/PredictionCanvas';
import { 
  Camera, UploadCloud, ShieldAlert, Sparkles, AlertCircle, 
  HelpCircle, Image as ImageIcon, Flame, Grid3x3, MapPin
} from 'lucide-react';

const PredictionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Webcam Capture States
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Grad-CAM Feature State (Explainability Overlay)
  const [showGradCam, setShowGradCam] = useState(false);

  // File Drop/Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setShowGradCam(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      setShowGradCam(false);
    }
  };

  // Webcam capture functions
  const startCamera = async () => {
    setResult(null);
    setError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to access your device camera. Please check permissions.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "captured_tooth_scan.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            setPreviewUrl(URL.createObjectURL(capturedFile));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Perform AI Prediction
  const runPrediction = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/predictions/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during prediction inference.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">AI Diagnostic Scan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload oral scans to run YOLO teeth object detection and severity classification models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Upload Zone / Preview Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Dental Scan Input</h3>
            
            {cameraActive ? (
              <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover"></video>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button onClick={capturePhoto} className="rounded-full bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 text-xs font-bold shadow-lg shadow-brand-500/20">
                    Capture Photo
                  </button>
                  <button onClick={stopCamera} className="rounded-full bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 text-xs font-bold">
                    Cancel
                  </button>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="relative">
                {/* YOLO Predictions overlay or simple image preview */}
                {result ? (
                  <PredictionCanvas imageUrl={`${API_BASE_URL}/predictions/prediction/${result.id}`} detections={result.detections} />
                ) : (
                  <img src={previewUrl} alt="Scan Upload" className="max-h-[400px] w-auto mx-auto rounded-lg block border border-slate-200 dark:border-slate-800 object-contain" />
                )}

                {/* Grad-CAM Heatmap overlay simulation */}
                {result && showGradCam && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/50 via-yellow-500/40 to-cyan-500/20 mix-blend-color-burn pointer-events-none rounded-lg animate-pulse" />
                )}
              </div>
            ) : (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 group"
              >
                <label className="cursor-pointer flex flex-col items-center gap-3">
                  <UploadCloud size={48} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Drag and drop your scan here, or <span className="text-brand-500 underline">browse files</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Supports standard JPG, PNG, or DICOM images</span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <button 
                  onClick={startCamera} 
                  disabled={cameraActive || loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  <Camera size={14} />
                  <span>Use Webcam</span>
                </button>

                {previewUrl && (
                  <button 
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setError(null);
                      setShowGradCam(false);
                    }}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {previewUrl && !result && (
                <button
                  onClick={runPrediction}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:from-brand-500 hover:to-brand-400 transition-all disabled:opacity-50"
                >
                  {loading ? 'Evaluating scan...' : 'Run Diagnostics'}
                </button>
              )}

              {result && (
                <div className="flex gap-2">
                  {/* Grad-CAM Activator */}
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                      showGradCam 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Flame size={14} />
                    <span>{showGradCam ? 'Hide Heatmap' : 'View Grad-CAM Heatmap'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-semibold text-rose-600 border border-rose-250/20">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Prediction Details & Recommendations */}
        <div className="lg:col-span-5">
          {loading ? (
            <div className="glass-card p-6 rounded-xl space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              
              {/* Primary diagnosis */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Diagnostic Output</h3>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Condition</span>
                  <h4 className="text-xl font-bold dark:text-white">{result.disease}</h4>
                  <p className="text-xs text-slate-400">AI confidence score: {result.confidence}%</p>
                </div>

                {/* Image quality warning */}
                {!result.is_valid && (
                  <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/10 p-3 text-[11px] font-semibold text-yellow-600 border border-yellow-250/20 leading-4">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Image Quality Warning</p>
                      <p className="text-slate-500 mt-0.5">The scan check calculated high blur index ({result.blur_score}) or unbalanced exposure ({result.brightness_score}). Retaking the image is suggested.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Multitask model outputs: Tooth Position + Quadrant */}
              {(result.tooth_number || result.quadrant) && (
                <div className="glass-card p-5 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Multitask Model Localisation</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {result.tooth_number && (
                      <div className="flex items-center gap-3 rounded-lg bg-brand-50/40 dark:bg-brand-950/10 p-3 border border-brand-100/40 dark:border-brand-900/20">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-500">
                          <Grid3x3 size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Enumeration</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{result.tooth_number}</p>
                        </div>
                      </div>
                    )}
                    {result.quadrant && (
                      <div className="flex items-center gap-3 rounded-lg bg-cyan-50/40 dark:bg-cyan-950/10 p-3 border border-cyan-100/40 dark:border-cyan-900/20">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-500">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Quadrant</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{result.quadrant}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Class probabilities details */}
              {result.class_probabilities && (
                <div className="glass-card p-6 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Disease Probabilities</h4>
                  <div className="space-y-2">
                    {Object.entries(result.class_probabilities).map(([className, prob]: any) => (
                      <div key={className} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="dark:text-slate-350">{className}</span>
                          <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              className === 'Caries'            ? 'bg-yellow-500' :
                              className === 'Deep Caries'       ? 'bg-orange-500' :
                              className === 'Periapical Lesion' ? 'bg-rose-500' :
                              className === 'Impacted Tooth'    ? 'bg-purple-500' :
                              'bg-brand-500'
                            }`}
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-6 rounded-xl text-center py-16 text-slate-400 space-y-2">
              <ImageIcon size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">Awaiting Diagnostic Data</p>
              <p className="text-xs max-w-xs mx-auto">Upload an oral scan and run diagnostics. Detection results will appear here.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PredictionPage;
