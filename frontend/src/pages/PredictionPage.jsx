import React, { useState, useRef } from 'react';
import api, { API_BASE_URL } from '../services/api';
import PredictionCanvas from '../components/PredictionCanvas';
import {
  Camera, UploadCloud, ShieldAlert, Sparkles, AlertCircle,
  HelpCircle, Image as ImageIcon, Flame, Grid3x3, MapPin
} from
  'lucide-react';

const PredictionPage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Webcam Capture States
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);



  // File Drop/Upload Handlers
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);

    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);

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
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
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
    } catch (err) {
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

            {cameraActive ?
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
              </div> :
              previewUrl ?
                <div className="relative">
                  {/* YOLO Predictions overlay or simple image preview */}
                  {result ?
                    <PredictionCanvas imageUrl={previewUrl || ''} detections={result.detections} /> :

                    <img src={previewUrl} alt="Scan Upload" className="max-h-[400px] w-auto mx-auto rounded-lg block border border-slate-200 dark:border-slate-800 object-contain" />
                  }


                </div> :

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 group">

                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <UploadCloud size={48} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                      Drag and drop your scan here, or <span className="text-brand-500 underline">browse files</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Supports standard JPG, PNG, or DICOM images</span>
                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                  </label>
                </div>
            }

            {/* Actions Panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  disabled={cameraActive || loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50">

                  <Camera size={14} />
                  <span>Use Webcam</span>
                </button>

                {previewUrl &&
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setError(null);

                    }}
                    className="text-xs font-semibold text-rose-500 hover:underline">

                    Clear Image
                  </button>
                }
              </div>

              {previewUrl && !result &&
                <button
                  onClick={runPrediction}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:from-brand-500 hover:to-brand-400 transition-all disabled:opacity-50">

                  {loading ? 'Evaluating scan...' : 'Run Diagnostics'}
                </button>
              }


            </div>

          </div>

          {error &&
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-semibold text-rose-600 border border-rose-250/20">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          }
        </div>

        {/* Right Side: Prediction Details & Recommendations */}
        <div className="lg:col-span-5">
          {loading ?
            <div className="glass-card p-6 rounded-xl space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div> :
            result ?
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
                  {!result.is_valid &&
                    <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/10 p-3 text-[11px] font-semibold text-yellow-600 border border-yellow-250/20 leading-4">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Image Quality Warning</p>
                        <p className="text-slate-500 mt-0.5">The scan check calculated high blur index ({result.blur_score}) or unbalanced exposure ({result.brightness_score}). Retaking the image is suggested.</p>
                      </div>
                    </div>
                  }
                </div>

                {/* All Detected Teeth Results */}
                {result.detections && result.detections.length > 0 && (() => {
                  // Compute quadrant + tooth_number on the frontend from box coords
                  // in case the backend version doesn't return them.
                  const dets = result.detections;

                  // Find image mid-point from bounding boxes
                  const allCx = dets.map(d => d.box[0] + d.box[2] / 2);
                  const allCy = dets.map(d => d.box[1] + d.box[3] / 2);
                  const midX = (Math.min(...allCx) + Math.max(...allCx)) / 2;
                  const midY = (Math.min(...allCy) + Math.max(...allCy)) / 2;

                  // Derive quadrant from box center if not provided by backend
                  const resolveQuadrant = (det) => {
                    if (det.quadrant) return det.quadrant;
                    const cx = det.box[0] + det.box[2] / 2;
                    const cy = det.box[1] + det.box[3] / 2;
                    if (cx < midX && cy < midY) return 'Q1 (Upper Right)';
                    if (cx >= midX && cy < midY) return 'Q2 (Upper Left)';
                    if (cx >= midX && cy >= midY) return 'Q3 (Lower Right)';
                    return 'Q4 (Lower Left)';
                  };

                  // Group by quadrant, sort by distance from midline → assign tooth numbers
                  const quadMap = {};
                  dets.forEach((det, i) => {
                    const q = resolveQuadrant(det);
                    if (!quadMap[q]) quadMap[q] = [];
                    quadMap[q].push({ det, i });
                  });

                  const toothNumbers = new Array(dets.length);
                  const quadrantLabels = new Array(dets.length);
                  Object.entries(quadMap).forEach(([q, group]) => {
                    const isLeft = q.includes('Left');
                    const sorted = [...group].sort((a, b) => {
                      const cxA = a.det.box[0] + a.det.box[2] / 2;
                      const cxB = b.det.box[0] + b.det.box[2] / 2;
                      return isLeft ? cxA - midX - (cxB - midX) : (midX - cxA) - (midX - cxB);
                    });
                    sorted.forEach(({ i }, pos) => {
                      toothNumbers[i] = `Tooth ${pos + 1}`;
                      quadrantLabels[i] = q;
                    });
                  });

                  return (
                    <div className="glass-card p-5 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Detailed Scan Results ({dets.length} detections)
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {dets.map((det, idx) => {
                          const qStr = quadrantLabels[idx] || det.quadrant || 'Unknown';
                          const tStr = det.tooth_number || toothNumbers[idx] || `Tooth ${idx + 1}`;
                          const isHealthy = (det.label || '').toLowerCase().includes('healthy');
                          const confidence = det.classifier_confidence || det.confidence;
                          const labelColor = isHealthy
                            ? 'text-emerald-500'
                            : det.label.toLowerCase().includes('tooth')
                              ? 'text-cyan-500'
                              : 'text-rose-500';

                          return (
                            <div key={idx} className="text-xs font-mono bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded border border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {tStr}
                                <span className="text-slate-400 font-normal px-1">|</span>
                                {qStr}
                                <span className="text-slate-400 font-normal px-1">|</span>
                                <span className={labelColor}>{det.label}</span>
                                {' '}({confidence.toFixed(1)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}




              </div> :

              <div className="glass-card p-6 rounded-xl text-center py-16 text-slate-400 space-y-2">
                <ImageIcon size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold">Awaiting Diagnostic Data</p>
                <p className="text-xs max-w-xs mx-auto">Upload an oral scan and run diagnostics. Detection results will appear here.</p>
              </div>
          }
        </div>

      </div>

    </div>);

};

export default PredictionPage;