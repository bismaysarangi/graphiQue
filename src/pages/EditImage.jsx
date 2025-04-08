"use client"

import { useState, useRef, useEffect } from "react"
import { Sliders, Sun, Upload, Download, Undo } from "lucide-react"

const EditImage = () => {
  // Canvas and image refs
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  // State for image and drawing
  const [image, setImage] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [editMode, setEditMode] = useState("enhancements") // 'filter', 'brush', or 'crop'

  // Filter states
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    exposure: 100,
    vignette: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    dropShadow: "0px 0px 0px black",
    saturate: 100,
  })

  // Brush states
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [opacity, setOpacity] = useState(1)

  // Crop states
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [cropStack, setCropStack] = useState([]) // Stack to store canvas states for undo

  // Constants
  const MAX_WIDTH = 800
  const MAX_HEIGHT = 600

  const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
    return {
      width: Math.floor(srcWidth * ratio),
      height: Math.floor(srcHeight * ratio),
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result)
        const img = new Image()
        img.onload = () => {
          const dimensions = calculateAspectRatioFit(img.width, img.height, MAX_WIDTH, MAX_HEIGHT)
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = dimensions.width
            canvas.height = dimensions.height
            applyFilters()
          }
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Filter functions
  const resetFilters = () => {
    // Save current state before resetting filters
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack((prev) => [...prev, imageData])

    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      dropShadow: "0px 0px 0px transparent",
      exposure: 100,
      vignette: 0,
    })
  }

  const applyFilters = () => {
    if (!image || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current

    const filterString = `
      brightness(${filters.brightness / 100})
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      invert(${filters.invert}%)
      drop-shadow(${filters.dropShadow})
      brightness(${filters.exposure / 100})
    `.trim()

    ctx.filter = filterString
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    if (filters.vignette > 0) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.max(canvas.width, canvas.height) / 1.5

      // Create a radial gradient for the vignette
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * (1 - filters.vignette / 100),
        centerX,
        centerY,
        radius,
      )

      gradient.addColorStop(0, "rgba(0,0,0,0)")
      gradient.addColorStop(1, "rgba(0,0,0,0.8)")

      // Apply the vignette
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "source-over" // Reset
    }
  }

  // Drawing functions
  const startDrawing = (e) => {
    if (editMode !== "brush") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Save current state for undo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack((prev) => [...prev, imageData])

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing || editMode !== "brush") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.globalAlpha = opacity
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (editMode !== "brush") return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.closePath()
    setIsDrawing(false)
  }

  const undoLastAction = () => {
    if (undoStack.length > 0) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      const lastState = undoStack[undoStack.length - 1]
      ctx.putImageData(lastState, 0, 0)
      setUndoStack((prev) => prev.slice(0, -1))
    }
  }

  // Crop functions
  const startCrop = (e) => {
    if (editMode !== "crop") return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsCropping(true)

    // Save current state for undo
    const ctx = canvas.getContext("2d")
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setCropStack((prev) => [...prev, { imageData, width: canvas.width, height: canvas.height }])
  }

  const updateCrop = (e) => {
    if (!isCropping || editMode !== "crop") return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropEnd({ x, y })
  }

  const endCrop = () => {
    if (editMode !== "crop") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const width = Math.abs(cropEnd.x - cropStart.x)
    const height = Math.abs(cropEnd.y - cropStart.y)

    const imageData = ctx.getImageData(x, y, width, height)

    canvas.width = width
    canvas.height = height
    ctx.putImageData(imageData, 0, 0)

    setIsCropping(false)
    setCropStart({ x: 0, y: 0 })
    setCropEnd({ x: 0, y: 0 })
  }

  const undoLastCrop = () => {
    if (cropStack.length > 0) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      const lastState = cropStack[cropStack.length - 1]

      // Restore canvas dimensions and image data
      canvas.width = lastState.width
      canvas.height = lastState.height
      ctx.putImageData(lastState.imageData, 0, 0)

      setCropStack((prev) => prev.slice(0, -1))
    }
  }

  // Save function
  const saveImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  useEffect(() => {
    if (editMode === "enhancements" || editMode === "filters") {
      applyFilters()
    }
  }, [filters, image, editMode])

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    if (editMode === "brush") {
      const touch = e.touches[0]
      startDrawing({
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    } else if (editMode === "crop") {
      const touch = e.touches[0]
      startCrop({
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    }
    e.preventDefault()
  }

  const handleTouchMove = (e) => {
    if (editMode === "brush" && isDrawing) {
      const touch = e.touches[0]
      draw({
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    } else if (editMode === "crop" && isCropping) {
      const touch = e.touches[0]
      updateCrop({
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    }
    e.preventDefault()
  }

  const handleTouchEnd = (e) => {
    if (editMode === "brush") {
      stopDrawing()
    } else if (editMode === "crop") {
      endCrop()
    }
    e.preventDefault()
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-gray-800 p-3 sm:p-6 rounded-xl shadow-xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
            Image Editor
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer text-sm sm:text-base">
              <Upload className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {image && (
              <>
                <button
                  onClick={saveImage}
                  className="bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base flex items-center"
                >
                  <Download className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  Save
                </button>
                {editMode === "enhancements" && (
                  <button onClick={resetFilters} className="text-gray-400 hover:text-gray-200 p-1.5 sm:p-2 rounded-md">
                    <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                {(editMode === "brush" || editMode === "crop") && (
                  <button
                    onClick={editMode === "brush" ? undoLastAction : undoLastCrop}
                    disabled={editMode === "brush" ? undoStack.length === 0 : cropStack.length === 0}
                    className="text-gray-400 hover:text-gray-200 p-1.5 sm:p-2 rounded-md disabled:opacity-50"
                  >
                    <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 overflow-x-auto">
          <button
            onClick={() => setEditMode("enhancements")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${
              editMode === "enhancements" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Enhancements
          </button>
          <button
            onClick={() => setEditMode("filters")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${
              editMode === "filters" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Filters
          </button>
          <button
            onClick={() => setEditMode("brush")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${
              editMode === "brush" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Brush Mode
          </button>
          <button
            onClick={() => setEditMode("crop")}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${
              editMode === "crop" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Crop Mode
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="w-full lg:w-64 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {editMode === "enhancements" ? (
              ["Brightness", "Contrast", "Saturation", "Blur"].map((label, index) => (
                <div key={index} className="space-y-1 sm:space-y-2">
                  <label className="flex items-center gap-1 sm:gap-2 text-gray-200 text-sm sm:text-base">
                    <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                    {label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={label === "Blur" ? 10 : 200}
                    value={filters[label.toLowerCase()]}
                    onChange={(e) => setFilters((prev) => ({ ...prev, [label.toLowerCase()]: Number(e.target.value) }))}
                    className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))
            ) : editMode === "filters" ? (
              ["Sepia", "Invert", "Grayscale", "Exposure", "Vignette"].map((label, index) => (
                <div key={index} className="space-y-1 sm:space-y-2">
                  <label className="flex items-center gap-1 sm:gap-2 text-gray-200 text-sm sm:text-base">
                    <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                    {label}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={label === "Vignette" ? 100 : 200}
                    value={filters[label.toLowerCase()]}
                    onChange={(e) => setFilters((prev) => ({ ...prev, [label.toLowerCase()]: Number(e.target.value) }))}
                    className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))
            ) : editMode === "brush" ? (
              // Brush controls
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="block text-gray-200 text-sm sm:text-base">Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8 cursor-pointer rounded"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="block text-gray-100 text-sm sm:text-base">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
                    className="w-full h-1.5 sm:h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="block text-gray-200 text-sm sm:text-base">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
                    className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              // Crop controls
              <div className="space-y-3 sm:space-y-4">
                <p className="text-gray-200 text-sm sm:text-base">Click and drag to select the crop area.</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden relative order-1 lg:order-2 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
            {image ? (
              <>
                <img
                  ref={imageRef}
                  src={image || "/placeholder.svg"}
                  alt="Uploaded"
                  className="hidden"
                  onLoad={applyFilters}
                />
                <canvas
                  ref={canvasRef}
                  className={`rounded-lg max-w-full max-h-full ${editMode === "brush" ? "cursor-crosshair" : ""}`}
                  onMouseDown={editMode === "crop" ? startCrop : startDrawing}
                  onMouseMove={editMode === "crop" ? updateCrop : draw}
                  onMouseUp={editMode === "crop" ? endCrop : stopDrawing}
                  onMouseOut={editMode === "crop" ? endCrop : stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                {isCropping && (
                  <div
                    style={{
                      position: "absolute",
                      left: Math.min(cropStart.x, cropEnd.x) + (canvasRef.current?.offsetLeft || 0),
                      top: Math.min(cropStart.y, cropEnd.y) + (canvasRef.current?.offsetTop || 0),
                      width: Math.abs(cropEnd.x - cropStart.x),
                      height: Math.abs(cropEnd.y - cropStart.y),
                      border: "2px dashed white",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </>
            ) : (
              <p className="text-gray-400 text-center px-4 text-sm sm:text-base">Upload an image to start editing.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditImage
