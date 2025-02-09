import React, { useRef, useState } from "react";

const PaintZone = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#FFFFFF");
  const [canvasColor, setCanvasColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [lastPosition, setLastPosition] = useState(null);

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

  const handleCanvasColorChange = (e) => {
    setCanvasColor(e.target.value);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = e.target.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleBrushColorChange = (e) => {
    setBrushColor(e.target.value);
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(Number(e.target.value));
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-gray-200">
      <h2 className="text-center text-3xl font-bold mb-6">PaintZone</h2>
      <div className="flex flex-wrap justify-between gap-6 mb-6">
        <div className="flex flex-col items-center">
          <label htmlFor="brushColor" className="mb-2 text-lg">Brush Color</label>
          <input
            type="color"
            id="brushColor"
            value={brushColor}
            onChange={handleBrushColorChange}
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="canvasColor" className="mb-2 text-lg">Canvas Background</label>
          <input
            type="color"
            id="canvasColor"
            value={canvasColor}
            onChange={handleCanvasColorChange}
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="brushSize" className="mb-2 text-lg">Brush Size</label>
          <select
            id="brushSize"
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="p-1 border rounded bg-gray-700 text-gray-200"
          >
            {[5, 10, 15, 20, 25, 30].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="border mx-auto bg-black mb-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="flex justify-center gap-6">
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
          onClick={handleClearCanvas}
        >
          Clear
        </button>
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
          onClick={handleSaveCanvas}
        >
          Save & Download
        </button>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
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
