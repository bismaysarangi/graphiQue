import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Sun, Upload, Download, RefreshCw, Undo } from 'lucide-react';

const EditImage = () => {
  // Canvas and image refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // State for image and drawing
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [editMode, setEditMode] = useState('filter'); // 'filter' or 'brush'

  // Filter states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });

  // Brush states
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);

  // Constants
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 600;

  const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: Math.floor(srcWidth * ratio),
      height: Math.floor(srcHeight * ratio)
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result);
        const img = new Image();
        img.onload = () => {
          const dimensions = calculateAspectRatioFit(
            img.width,
            img.height,
            MAX_WIDTH,
            MAX_HEIGHT
          );
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            applyFilters();
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    });
  };

  const applyFilters = () => {
    if (!image || !canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    const filterString = `
      brightness(${filters.brightness / 100})
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
    `.trim();
    
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (editMode !== 'brush') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Save current state for undo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, imageData]);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || editMode !== 'brush') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (editMode !== 'brush') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const undoLastAction = () => {
    if (undoStack.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const lastState = undoStack[undoStack.length - 1];
      ctx.putImageData(lastState, 0, 0);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Save function
  const saveImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (editMode === 'filter') {
      applyFilters();
    }
  }, [filters, image, editMode]);

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-5xl bg-gray-800 p-6 rounded-xl shadow-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <Sliders className="w-6 h-6" />
            Image Editor
          </h3>
          <div className="flex gap-2">
            <label className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
              <Upload className="mr-2 w-4 h-4" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {image && (
              <>
                <button
                  onClick={saveImage}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  <Download className="mr-2 w-4 h-4 inline" />
                  Save
                </button>
                {editMode === 'filter' && (
                  <button
                    onClick={resetFilters}
                    className="text-gray-400 hover:text-gray-200 p-2 rounded-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {editMode === 'brush' && (
                  <button
                    onClick={undoLastAction}
                    disabled={undoStack.length === 0}
                    className="text-gray-400 hover:text-gray-200 p-2 rounded-md disabled:opacity-50"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setEditMode('filter')}
            className={`px-4 py-2 rounded-lg ${
              editMode === 'filter'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Filter Mode
          </button>
          <button
            onClick={() => setEditMode('brush')}
            className={`px-4 py-2 rounded-lg ${
              editMode === 'brush'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Brush Mode
          </button>
        </div>

        <div className="flex gap-8">
          <div className="w-64 space-y-4">
            {editMode === 'filter' ? (
              // Filter controls
              ['Brightness', 'Contrast', 'Saturation', 'Blur'].map((label, index) => (
                <div key={index} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-200">
                    <Sun className="w-4 h-4" />
                    {label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={label === 'Blur' ? 10 : 200}
                    value={filters[label.toLowerCase()]}
                    onChange={(e) =>
                      handleFilterChange(
                        label.toLowerCase(),
                        Number(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg"
                  />
                </div>
              ))
            ) : (
              // Brush controls
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-200">Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-200">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-200">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
            {image ? (
              <>
                <img
                  ref={imageRef}
                  src={image}
                  alt="Uploaded"
                  className="hidden"
                  onLoad={applyFilters}
                />
                <canvas
                  ref={canvasRef}
                  className={`rounded-lg ${editMode === 'brush' ? 'cursor-crosshair' : ''}`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                />
              </>
            ) : (
              <p className="text-gray-400">Upload an image to start editing.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditImage;