import React, { useRef, useState, useEffect } from 'react';












const PredictionCanvas = ({ imageUrl, detections }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const calculateScale = () => {
    const img = imageRef.current;
    if (img && img.complete && img.naturalWidth && img.naturalHeight) {
      const rect = img.getBoundingClientRect();
      setScale({
        x: rect.width / img.naturalWidth,
        y: rect.height / img.naturalHeight
      });
      setImageLoaded(true);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Helper to color-code diseases
  const getLabelColors = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('healthy')) {
      return { border: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    }
    if (lower.includes('caries') || lower.includes('cavity') || lower.includes('severe')) {
      return { border: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' };
    }
    if (lower.includes('gingivitis') || lower.includes('periodontitis') || lower.includes('tartar')) {
      return { border: 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' };
    }
    return { border: 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' };
  };

  return (
    <div ref={containerRef} className="relative mx-auto w-fit overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Dental Scan Preview"
        className="block max-h-[450px] w-auto object-contain select-none"
        onLoad={calculateScale} />
      
      {imageLoaded && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {detections.map((det, index) => {
            if (!det.segmentation || det.segmentation.length === 0) return null;
            
            const points = det.segmentation
              .map(pt => `${pt[0] * scale.x},${pt[1] * scale.y}`)
              .join(' ');
              
            const colors = getLabelColors(det.label);
            
            // Extract the border color to use as stroke
            let strokeColor = '#3b82f6'; // default blue
            if (colors.border.includes('emerald')) strokeColor = '#10b981';
            else if (colors.border.includes('rose')) strokeColor = '#f43f5e';
            else if (colors.border.includes('orange')) strokeColor = '#f97316';
            else if (colors.border.includes('cyan')) strokeColor = '#06b6d4';
            
            return (
              <polygon
                key={`poly-${index}`}
                points={points}
                fill={`${strokeColor}33`} // 20% opacity
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-all duration-200 pointer-events-auto hover:fill-opacity-50 cursor-pointer"
              />
            );
          })}
        </svg>
      )}

      {imageLoaded &&
      detections.map((det, index) => {
        const [x, y, w, h] = det.box;
        const left = x * scale.x;
        const top = y * scale.y;
        const width = w * scale.x;
        const height = h * scale.y;

        const colors = getLabelColors(det.label);

        return (
          <div
            key={index}
            className={`absolute border-2 rounded transition-all duration-200 group hover:ring-2 hover:ring-brand-400 cursor-pointer ${colors.border}`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }}>
            
              {/* Tooltip Label */}
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex items-center gap-1.5 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-md z-15 whitespace-nowrap">
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`}></span>
                <span>{det.label}</span>
                <span className="text-slate-400">({det.confidence}%)</span>
              </div>
            </div>);

      })}
    </div>);

};

export default PredictionCanvas;