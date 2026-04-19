"use client";

import React, { useRef, useState, useEffect } from "react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  label?: string;
  width?: number;
  height?: number;
  initialImage?: string | null;
}

export default function SignaturePad({ 
  onSave, 
  label = "Assinatura do Cliente", 
  width = 500, 
  height = 200,
  initialImage = null
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        // Load initial image if provided
        if (initialImage) {
          const img = new Image();
          img.src = initialImage;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        }
      }
    }
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSave("");
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    } else {
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY,
      };
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm relative group">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-auto cursor-crosshair touch-none bg-white"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute top-2 right-2 p-1.5 text-[10px] font-bold bg-white/80 hover:bg-gray-100 text-gray-500 rounded-md border border-gray-100 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 shadow-sm"
        >
          Limpar
        </button>
      </div>
      <p className="text-[10px] text-gray-400 italic text-center">
        Assine no espaço acima utilizando o mouse ou touch
      </p>
    </div>
  );
}
