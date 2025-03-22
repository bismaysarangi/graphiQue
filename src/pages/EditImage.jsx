import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Sun, Upload, Download, RefreshCw, Undo, Crop } from 'lucide-react';

const EditImage = () => {
  // Canvas and image refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // State for image and drawing
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [editMode, setEditMode] = useState('enhancements'); // 'filter', 'brush', or 'crop'
 
  // Filter states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    dropShadow: "0px 0px 0px black",
    saturate: 100,
  });

  // Brush states
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);

  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [cropStack, setCropStack] = useState([]); // Stack to store canvas states for undo
  const [cropMode, setCropMode] = useState('rectangular'); // 'rectangular' or 'freehand'
  const [freehandPath, setFreehandPath] = useState([]);

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
    // Save current state before applying the filter
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, imageData]);

    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    // Save current state before resetting filters
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, imageData]);

    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      dropShadow: '0px 0px 0px transparent',
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
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      invert(${filters.invert}%)
      drop-shadow(${filters.dropShadow})
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

  // Crop functions
  const startCrop = (e) => {
    if (editMode !== 'crop') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);

    // Save current state for undo
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCropStack(prev => [...prev, { imageData, width: canvas.width, height: canvas.height }]);
  };

  const updateCrop = (e) => {
    if (!isCropping || editMode !== 'crop') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEnd({ x, y });
  };

  const endCrop = () => {
    if (editMode !== 'crop') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    const imageData = ctx.getImageData(x, y, width, height);
    
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
    
    setIsCropping(false);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const undoLastCrop = () => {
    if (cropStack.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const lastState = cropStack[cropStack.length - 1];
      
      // Restore canvas dimensions and image data
      canvas.width = lastState.width;
      canvas.height = lastState.height;
      ctx.putImageData(lastState.imageData, 0, 0);
      
      setCropStack(prev => prev.slice(0, -1));
    }
  };
  const toggleCropMode = () => {
    setCropMode(prev => (prev === 'rectangular' ? 'freehand' : 'rectangular'));
  };

  const startFreehandCrop = (e) => {
    if (editMode !== 'crop' || cropMode !== 'freehand') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFreehandPath([{ x, y }]);
  };

  const updateFreehandCrop = (e) => {
    if (freehandPath.length === 0 || cropMode !== 'freehand') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFreehandPath([...freehandPath, { x, y }]);
  };

  const applyFreehandCrop = () => {
    if (freehandPath.length < 3) return; // Need at least 3 points for a valid crop
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
  
    // Draw the original image onto the temporary canvas
    tempCtx.drawImage(canvas, 0, 0);
  
    // Clear the original canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Define clipping path for freehand selection
    ctx.beginPath();
    freehandPath.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.clip();
  
    // Draw the cropped region back onto the original canvas
    ctx.drawImage(tempCanvas, 0, 0);
  
    // Clear freehand path state
    setFreehandPath([]);
  };
  
  useEffect(() => {
    if (editMode === 'enhancements') {
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
                {editMode === 'enhancements' && (
                  <button
                    onClick={resetFilters}
                    className="text-gray-400 hover:text-gray-200 p-2 rounded-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {(editMode === 'brush' || editMode === 'crop') && (
                  <button
                    onClick={editMode === 'brush' ? undoLastAction : undoLastCrop}
                    disabled={editMode === 'brush' ? undoStack.length === 0 : cropStack.length === 0}
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
            onClick={() => setEditMode('enhancements')}
            className={`px-4 py-2 rounded-lg ${
              editMode === 'enhancements'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Enhancements
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
          <button
            onClick={() => setEditMode('crop')}
            className={`px-4 py-2 rounded-lg ${
              editMode === 'crop'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Crop Mode
            </button>
          {editMode === 'crop' && (
            <button onClick={toggleCropMode} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300">
              Switch to {cropMode === 'rectangular' ? 'Freehand' : 'Rectangular'}
            </button>
          )}
        </div>

        <div className="flex gap-8">
          <div className="w-64 space-y-4">
            {editMode === 'enhancements' ? (
              // Filter controls
              [
                'Brightness',
                'Contrast',
                'Saturation',
                'Blur',
                'Grayscale',
                'Sepia',
                'Invert',

              ].map((label, index) => (
                <div key={index} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-200">
                    <Sun className="w-4 h-4" />
                    {label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={

                      label === 'Blur' ? 10 :  
                      label === 'Grayscale' || label === 'Sepia' || label === 'Invert' ? 100 : 200

                    }
                    value={filters[label.toLowerCase().replace(' ', '-')]}
                    onChange={(e) =>
                      handleFilterChange(
                        label.toLowerCase().replace(' ', '-'),
                        Number(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg"
                  />
                </div>
              ))
            ) : editMode === 'brush' ? (
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
                  <label className="block text-gray-100">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg"
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
            ) : (
              // Crop controls
              <div className="space-y-4">
                <p className="text-gray-200">Click and drag to select the crop area.</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden relative">
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
                  onMouseDown={(e) => {
                    if (editMode === 'crop') {
                      cropMode === 'rectangular' ? startCrop(e) : startFreehandCrop(e);
                    } else {
                      startDrawing(e);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (editMode === 'crop') {
                      cropMode === 'rectangular' ? updateCrop(e) : updateFreehandCrop(e);
                    } else {
                      draw(e);
                    }
                  }}
                  onMouseUp={(e) => {
                    if (editMode === 'crop') {
                      cropMode === 'rectangular' ? endCrop() : applyFreehandCrop();
                    } else {
                      stopDrawing();
                    }
                  }}
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