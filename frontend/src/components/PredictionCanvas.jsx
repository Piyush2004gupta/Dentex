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

  // Helper to color-code by Quadrant instead of Disease
  const getQuadrantColors = (quadrant) => {
    const qStr = String(quadrant || '');
    if (qStr.includes('1')) return { border: 'border-emerald-500 bg-emerald-500/10', hex: '#10b981' }; // Green
    if (qStr.includes('2')) return { border: 'border-rose-500 bg-rose-500/10', hex: '#f43f5e' };       // Red
    if (qStr.includes('3')) return { border: 'border-blue-500 bg-blue-500/10', hex: '#3b82f6' };      // Blue
    if (qStr.includes('4')) return { border: 'border-amber-500 bg-amber-500/10', hex: '#f59e0b' };    // Orange/Yellow

    return { border: 'border-cyan-500 bg-cyan-500/10', hex: '#06b6d4' };
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

            const colors = getQuadrantColors(det.quadrant);
            const strokeColor = colors.hex;

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

          const colors = getQuadrantColors(det.quadrant);
          const tNum = parseInt(String(det.tooth_number).replace(/\D/g, '')) || 0;

          return (
            <div
              key={index}
              className={`absolute border-2 transition-all duration-200 cursor-pointer ${colors.border}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`
              }}>

              {/* Research Paper Label (Single line, no background, colored text) */}
              <div 
                className={`absolute ${tNum % 2 === 0 ? 'top-full mt-0.5' : 'bottom-full mb-0.5'} left-0 flex items-center text-[8px] sm:text-[9px] font-extrabold z-20 whitespace-nowrap pointer-events-none drop-shadow-md transition-all`}
                style={{ color: colors.hex, textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
              >
                Q={det.quadrant ? String(det.quadrant).replace(/\D/g, '') : '?'}, N={tNum || '?'}, D={det.label}
              </div>
            </div>);

        })}
    </div>);

};

export default PredictionCanvas;