import React, { useRef, useState, useEffect } from "react";

const PaintZone = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#FFFFFF");
  const [canvasColor, setCanvasColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [lastPosition, setLastPosition] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasColor]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDrawing(true);
    setLastPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!isDrawing || !canvas || !ctx || !lastPosition) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = dataURL;
    link.click();
  };

  const handleRetrieveCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const savedCanvas = localStorage.getItem("canvasContents");
    if (savedCanvas) {
      const img = new Image();
      img.src = savedCanvas;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const handleSaveToLocal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    localStorage.setItem("canvasContents", dataURL);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-200 p-6 flex flex-col items-center">
      {/* Control Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        <div className="bg-[#111] p-5 rounded-2xl flex flex-col items-center border border-gray-700 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-shadow duration-300">
          <label className="mb-3 text-sm font-medium tracking-wide">Brush Color</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 cursor-pointer border-none rounded"
          />
        </div>

        <div className="bg-[#111] p-5 rounded-2xl flex flex-col items-center border border-gray-700 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-shadow duration-300">
          <label className="mb-3 text-sm font-medium tracking-wide">Canvas Background</label>
          <input
            type="color"
            value={canvasColor}
            onChange={(e) => setCanvasColor(e.target.value)}
            className="w-10 h-10 cursor-pointer border-none rounded"
          />
        </div>

        <div className="bg-[#111] p-5 rounded-2xl flex flex-col items-center border border-gray-700 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-shadow duration-300">
          <label className="mb-3 text-sm font-medium tracking-wide">Brush Size</label>
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="mt-1 p-2 rounded bg-gray-800 text-white text-sm w-24 text-center"
          >
            {[5, 10, 15, 20, 25, 30].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full max-w-4xl mb-8 border border-gray-700 rounded-lg overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={750}
          height={450}
          className="w-full h-full block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <button
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          onClick={handleClearCanvas}
        >
          Clear
        </button>
        <button
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSaveCanvas}
        >
          Save & Download
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            handleSaveToLocal();
            handleRetrieveCanvas();
          }}
        >
          Retrieve
        </button>
      </div>
    </div>
  );
};

export default PaintZone;
