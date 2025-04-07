import { useState, useRef, useEffect } from "react"
import { Sliders, Sun, Upload, Download, Undo, Brush, Crop, ImageIcon, Layers } from "lucide-react"

const EditImage = () => {
  // Canvas and image refs
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  // State for image and drawing
  const [image, setImage] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [editMode, setEditMode] = useState("enhancements") // 'enhancements', 'filters', 'brush', or 'crop'

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
  const [cropStack, setCropStack] = useState([])

  // Constants
  const MAX_WIDTH = 800
  const MAX_HEIGHT = 600

  // Responsive state
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
        const result = event.target?.result
        setImage(result)
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
        img.src = result
        img.crossOrigin = "anonymous"
      }
      reader.readAsDataURL(file)
    }
  }

  const resetFilters = () => {
    // Save current state before resetting filters
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

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
      saturate: 100,
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
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
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    let x, y
    if ("touches" in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

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
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    let x, y
    if ("touches" in e) {
      // Touch event
      e.preventDefault() // Prevent scrolling while drawing
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

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
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.closePath()
    setIsDrawing(false)
  }

  const undoLastAction = () => {
    if (undoStack.length > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const lastState = undoStack[undoStack.length - 1]
      ctx.putImageData(lastState, 0, 0)
      setUndoStack((prev) => prev.slice(0, -1))
    }
  }

  // Crop functions
  const startCrop = (e) => {
    if (editMode !== "crop") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    let x, y
    if ("touches" in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsCropping(true)

    // Save current state for undo
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setCropStack((prev) => [...prev, { imageData, width: canvas.width, height: canvas.height }])
  }

  const updateCrop = (e) => {
    if (!isCropping || editMode !== "crop") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    let x, y
    if ("touches" in e) {
      // Touch event
      e.preventDefault() // Prevent scrolling while cropping
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    setCropEnd({ x, y })
  }

  const endCrop = () => {
    if (editMode !== "crop" || !isCropping) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const width = Math.abs(cropEnd.x - cropStart.x)
    const height = Math.abs(cropEnd.y - cropStart.y)

    // Only crop if the selection has a valid size
    if (width > 10 && height > 10) {
      const imageData = ctx.getImageData(x, y, width, height)

      canvas.width = width
      canvas.height = height
      ctx.putImageData(imageData, 0, 0)
    }

    setIsCropping(false)
    setCropStart({ x: 0, y: 0 })
    setCropEnd({ x: 0, y: 0 })
  }

  const undoLastCrop = () => {
    if (cropStack.length > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

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

  // Resize canvas when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (!image || !imageRef.current || !canvasRef.current || !containerRef.current) return

      // Get container dimensions
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      // Calculate new dimensions while maintaining aspect ratio
      const img = imageRef.current
      const dimensions = calculateAspectRatioFit(img.naturalWidth, img.naturalHeight, containerWidth, containerHeight)

      // Update canvas size
      const canvas = canvasRef.current
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      // Reapply filters
      applyFilters()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [image])

  // Filter presets
  const applyPreset = (preset) => {
    switch (preset) {
      case "vintage":
        setFilters({
          ...filters,
          sepia: 50,
          contrast: 120,
          brightness: 90,
          vignette: 30,
          saturation: 85,
          blur: 0,
          grayscale: 0,
          invert: 0,
          exposure: 100,
          dropShadow: "0px 0px 0px transparent",
          saturate: 100,
        })
        break
      case "blackAndWhite":
        setFilters({
          ...filters,
          grayscale: 100,
          contrast: 120,
          brightness: 110,
          vignette: 0,
          saturation: 0,
          blur: 0,
          sepia: 0,
          invert: 0,
          exposure: 100,
          dropShadow: "0px 0px 0px transparent",
          saturate: 100,
        })
        break
      case "warm":
        setFilters({
          ...filters,
          sepia: 30,
          contrast: 110,
          brightness: 105,
          saturation: 120,
          vignette: 0,
          blur: 0,
          grayscale: 0,
          invert: 0,
          exposure: 105,
          dropShadow: "0px 0px 0px transparent",
          saturate: 100,
        })
        break
      case "cool":
        setFilters({
          ...filters,
          sepia: 0,
          contrast: 110,
          brightness: 100,
          saturation: 90,
          vignette: 0,
          blur: 0,
          grayscale: 20,
          invert: 0,
          exposure: 95,
          dropShadow: "0px 0px 0px transparent",
          saturate: 100,
        })
        break
      default:
        break
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-gray-800 p-3 sm:p-6 rounded-xl shadow-xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            Image Editor
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer text-sm sm:text-base">
              <Upload className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Upload
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {image && (
              <>
                <button
                  onClick={saveImage}
                  className="bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base flex items-center"
                >
                  <Download className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Save
                </button>
                {editMode === "enhancements" && (
                  <button
                    onClick={resetFilters}
                    className="text-gray-400 hover:text-gray-200 p-1.5 sm:p-2 rounded-md"
                    aria-label="Reset filters"
                  >
                    <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
                {(editMode === "brush" || editMode === "crop") && (
                  <button
                    onClick={editMode === "brush" ? undoLastAction : undoLastCrop}
                    disabled={editMode === "brush" ? undoStack.length === 0 : cropStack.length === 0}
                    className="text-gray-400 hover:text-gray-200 p-1.5 sm:p-2 rounded-md disabled:opacity-50"
                    aria-label="Undo"
                  >
                    <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <button
            onClick={() => setEditMode("enhancements")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              editMode === "enhancements" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Enhancements</span>
          </button>
          <button
            onClick={() => setEditMode("filters")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              editMode === "filters" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filters</span>
          </button>
          <button
            onClick={() => setEditMode("brush")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              editMode === "brush" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Brush</span>
          </button>
          <button
            onClick={() => setEditMode("crop")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              editMode === "crop" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Crop</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 space-y-4">
            {editMode === "enhancements" && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyPreset("vintage")}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs"
                  >
                    Vintage
                  </button>
                  <button
                    onClick={() => applyPreset("blackAndWhite")}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs"
                  >
                    B&W
                  </button>
                  <button
                    onClick={() => applyPreset("warm")}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs"
                  >
                    Warm
                  </button>
                  <button
                    onClick={() => applyPreset("cool")}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs"
                  >
                    Cool
                  </button>
                </div>
                {["Brightness", "Contrast", "Saturation", "Blur"].map((label, index) => (
                  <div key={index} className="space-y-1">
                    <label className="flex items-center justify-between text-gray-200 text-sm">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" />
                        {label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {filters[label.toLowerCase()]}
                        {label === "Blur" ? "px" : "%"}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={label === "Blur" ? 10 : 200}
                      value={filters[label.toLowerCase()]}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, [label.toLowerCase()]: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                  </div>
                ))}
              </>
            )}

            {editMode === "filters" && (
              <>
                {["Sepia", "Invert", "Grayscale", "Exposure", "Vignette"].map((label, index) => (
                  <div key={index} className="space-y-1">
                    <label className="flex items-center justify-between text-gray-200 text-sm">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" />
                        {label}
                      </span>
                      <span className="text-xs text-gray-400">{filters[label.toLowerCase()]}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={label === "Vignette" ? 100 : 200}
                      value={filters[label.toLowerCase()]}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, [label.toLowerCase()]: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                  </div>
                ))}
              </>
            )}

            {editMode === "brush" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-gray-200 text-sm">Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8 cursor-pointer rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center justify-between text-gray-200 text-sm">
                    <span>Brush Size</span>
                    <span className="text-xs text-gray-400">{brushSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center justify-between text-gray-200 text-sm">
                    <span>Opacity</span>
                    <span className="text-xs text-gray-400">{Math.round(opacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-xs">
                    Tip: Click and drag to draw on the image. Use the undo button to remove the last stroke.
                  </p>
                </div>
              </div>
            )}

            {editMode === "crop" && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-xs">
                    Click and drag to select the crop area. Release to apply the crop.
                  </p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-xs">Use the undo button to revert to the previous crop state.</p>
                </div>
              </div>
            )}

            {!image && (
              <div className="p-4 bg-gray-700 rounded-lg text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-300 text-sm">Upload an image to start editing</p>
              </div>
            )}
          </div>

          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden relative min-h-[300px] md:min-h-[400px]"
          >
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
                  className={`rounded-lg max-w-full max-h-full ${editMode === "brush" || editMode === "crop" ? "cursor-crosshair" : ""}`}
                  onMouseDown={editMode === "crop" ? startCrop : startDrawing}
                  onMouseMove={editMode === "crop" ? updateCrop : draw}
                  onMouseUp={editMode === "crop" ? endCrop : stopDrawing}
                  onMouseOut={editMode === "crop" ? endCrop : stopDrawing}
                  onTouchStart={editMode === "crop" ? startCrop : startDrawing}
                  onTouchMove={editMode === "crop" ? updateCrop : draw}
                  onTouchEnd={editMode === "crop" ? endCrop : stopDrawing}
                />
                {isCropping && (
                  <div
                    style={{
                      position: "absolute",
                      left: Math.min(cropStart.x, cropEnd.x),
                      top: Math.min(cropStart.y, cropEnd.y),
                      width: Math.abs(cropEnd.x - cropStart.x),
                      height: Math.abs(cropEnd.y - cropStart.y),
                      border: "2px dashed white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 text-sm sm:text-base">Upload an image to start editing</p>
                <p className="text-gray-500 text-xs mt-2">Supports JPG, PNG, and WebP formats</p>
              </div>
            )}
          </div>
        </div>

        {image && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            Tip: Use the save button to download your edited image
          </div>
        )}
      </div>
    </div>
  )
}

export default EditImage

