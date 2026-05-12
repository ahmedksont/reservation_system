"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

export interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({
  dots = [],
  lineColor = "#92400E",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] bg-stone-50 rounded-[2rem] relative overflow-hidden border border-stone-100">
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full p-4"
      >
        {/* Simplified World Background */}
        <defs>
          <linearGradient id="gradient-map" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E7E5E4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D6D3D1" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* World map paths could be added here, but a clean dotted grid looks more modern */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 20}
            x2="800"
            y2={i * 20}
            stroke="#E7E5E4"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 20}
            y1="0"
            x2={i * 20}
            y2="400"
            stroke="#E7E5E4"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}

        {dots.map((dot, i) => {
          const start = projectPoint(dot.start.lat, dot.start.lng);
          const end = projectPoint(dot.end.lat, dot.end.lng);
          const path = createPath(start, end);

          // Simulated traffic status based on index or random
          const trafficLevels = ["Fluide", "Normal", "Ralenti"];
          const startTraffic = trafficLevels[i % 3];
          const endTraffic = trafficLevels[(i + 1) % 3];

          return (
            <g key={`path-${i}`}>
              <defs>
                <linearGradient id={`arc-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={lineColor} stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#D97706" stopOpacity="1" />
                  <stop offset="100%" stopColor={lineColor} stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <motion.path
                d={path}
                stroke={`url(#arc-gradient-${i})`}
                strokeWidth="2.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.5, delay: i * 0.5, ease: "easeOut" }}
              />

              {/* Moving Pulse */}
              <motion.circle
                r="3"
                fill="#FFF"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  offsetPath: `path("${path}")`,
                  filter: `drop-shadow(0 0 4px ${lineColor})`,
                }}
              />
              
              <circle cx={start.x} cy={start.y} r="4" fill="#1C1917" className="shadow-lg" />
              <circle cx={end.x} cy={end.y} r="4" fill={lineColor} className="shadow-lg" />

              {/* Traffic Badges in SVG */}
              <foreignObject x={start.x - 40} y={start.y + 15} width="80" height="40">
                <div className="flex flex-col items-center">
                   <p className="text-[7px] font-black uppercase tracking-tighter text-stone-900 mb-0.5">{dot.start.label}</p>
                   <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-stone-100 shadow-sm">
                      <div className={`w-1 h-1 rounded-full ${startTraffic === 'Fluide' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[5px] font-black uppercase text-stone-400">Trafic {startTraffic}</span>
                   </div>
                </div>
              </foreignObject>

              <foreignObject x={end.x - 40} y={end.y + 15} width="80" height="40">
                <div className="flex flex-col items-center">
                   <p className="text-[7px] font-black uppercase tracking-tighter text-stone-900 mb-0.5">{dot.end.label}</p>
                   <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-stone-100 shadow-sm">
                      <div className={`w-1 h-1 rounded-full ${endTraffic === 'Fluide' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[5px] font-black uppercase text-stone-400">Trafic {endTraffic}</span>
                   </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest text-stone-900">Map Live Network</span>
      </div>
    </div>
  );
}
