import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision'

interface HandControllerProps {
  onExpansionChange: (value: number) => void
  onSwipe: (direction: 'left' | 'right') => void
  onHandPosition: (x: number, y: number) => void
}

export function HandController({ onExpansionChange, onSwipe, onHandPosition }: HandControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const lastHandX = useRef<number | null>(null)
  const swipeCooldown = useRef(false)

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null
    let animationFrameId: number
    let isActive = true 

    const setupHandLandmarker = async () => {
      try {
        console.log("Loading Vision Tasks...")
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        )
        
        if (!isActive) return

        console.log("Vision Tasks Loaded. Loading HandLandmarker Model...")
        
        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          })
        } catch (e) {
          console.warn("GPU initialization failed, attempting CPU fallback...", e)
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          })
        }
        
        if (!isActive) {
            handLandmarker.close()
            return
        }

        console.log("HandLandmarker Loaded.")
        setIsLoaded(true)
        startWebcam()
      } catch (error) {
        if (!isActive) return
        console.error("Error setting up hand landmarker:", error)
        alert("Failed to load hand tracking model: " + error)
      }
    }

    const startWebcam = () => {
      console.log("Attempting to start webcam on port " + window.location.port)
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         console.error("Browser API not supported")
         alert("Your browser does not support webcam access via getUserMedia")
         return
      }

      navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: 320, 
            height: 180,
            frameRate: { ideal: 30 }
        } 
      }).then((stream) => {
          if (!isActive) {
              stream.getTracks().forEach(track => track.stop())
              return
          }
          console.log("Webcam access granted")
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.addEventListener("loadeddata", predictWebcam)
          }
        }).catch((err) => {
          if (!isActive) return
          console.error("Error accessing webcam:", err)
          
          let msg = "Error accessing webcam."
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
             msg = "Camera permission denied. Please allow camera access in your browser settings (and OS settings on macOS)."
          } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
             msg = "Camera is in use by another application. Please close Zoom/Teams/etc and reload."
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
             msg = "No camera found. Please connect a camera."
          } else {
             msg = `Camera error: ${err.name} - ${err.message}`
          }
          
          alert(msg)
        })
    }

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      
      if (!ctx) return

      // Resize canvas to match video
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const startTimeMs = performance.now()
      if (video.currentTime > 0) {
        const results = handLandmarker.detectForVideo(video, startTimeMs)

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw a small indicator that we are running
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)"
        ctx.fillRect(10, 10, 10, 10)
        
        if (results.landmarks && results.landmarks.length > 0) {
            // Log once every 100 frames to avoid spam, or just use visual debug
            // console.log("Hands detected:", results.landmarks.length)
            
          const drawingUtils = new DrawingUtils(ctx)
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 2
            })
            drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 })
          }

          // 1. Calculate Expansion/Scaling
          
          let expansionValue = 0
          
          const getHandOpenness = (landmarks: any[]) => {
            // Simple heuristic: Average distance from wrist (0) to finger tips (4,8,12,16,20)
            const wrist = landmarks[0]
            const tips = [4, 8, 12, 16, 20]
            let avgDist = 0
            for (const t of tips) {
                const tip = landmarks[t]
                avgDist += Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2))
            }
            avgDist /= 5
            // console.log("AvgDist:", avgDist)
            // Map 0.05 (fist) to 0.25 (open) -> 0 to 1 (Adjusted for typical webcam distance)
            return Math.min(Math.max((avgDist - 0.05) * 5, 0), 1)
          }

          if (results.landmarks.length === 2) {
            const hand1 = results.landmarks[0]
            const hand2 = results.landmarks[1]
            
            // Distance between wrists
            const dist = Math.sqrt(
              Math.pow(hand1[0].x - hand2[0].x, 2) + 
              Math.pow(hand1[0].y - hand2[0].y, 2)
            )
            
            // Average openness
            const open1 = getHandOpenness(hand1)
            const open2 = getHandOpenness(hand2)
            const avgOpenness = (open1 + open2) / 2
            
            // Combine: Distance implies "size", Openness implies "blooming/tension"
            // Map distance 0.1-0.8 to 0-1
            const distFactor = Math.min(Math.max((dist - 0.1) * 2, 0), 1)
            
            // Result is a mix.
            expansionValue = distFactor * (0.5 + 0.5 * avgOpenness)

          } else if (results.landmarks.length === 1) {
            // One hand: Just Openness
            expansionValue = getHandOpenness(results.landmarks[0])
          }
          
          // Debug log (throttle)
          if (Math.random() < 0.05) {
             console.log("Expansion:", expansionValue)
          }

          onExpansionChange(expansionValue)

          // 2. Track hand position for camera movement (using primary hand centroid)
          if (results.landmarks.length > 0) {
            const hand = results.landmarks[0]
            const centroidX = hand[9].x // Middle finger mcp (normalized 0-1)
            const centroidY = hand[9].y // Middle finger mcp (normalized 0-1)
            
            // Map from 0-1 to -1 to 1 (centered)
            const normalizedX = (centroidX - 0.5) * 2
            const normalizedY = (centroidY - 0.5) * 2
            
            onHandPosition(normalizedX, -normalizedY) // Invert Y for natural movement
          }

          // 3. Detect Swipe
          if (results.landmarks.length > 0) {
            const hand = results.landmarks[0]
            const centroidX = hand[9].x // Middle finger mcp
            
            if (lastHandX.current !== null && !swipeCooldown.current) {
              const deltaX = centroidX - lastHandX.current
              const threshold = 0.05 // Movement threshold
              
              if (Math.abs(deltaX) > threshold) {
                const direction = deltaX > 0 ? 'left' : 'right'
                console.log(`Swipe detected! DeltaX: ${deltaX.toFixed(3)}, Direction: ${direction}`)
                // If x decreases (deltaX < 0) -> Hand moving LEFT in video (which is visually RIGHT if mirrored)
                // Let's assume natural mapping: Left Movement -> Rotate Left
                onSwipe(direction) 
                swipeCooldown.current = true
                setTimeout(() => { swipeCooldown.current = false }, 500)
              }
            }
            lastHandX.current = centroidX
          }
        } else {
            lastHandX.current = null
            // Reset expansion to 0 when hands are lost to prevent "stuck" state
            onExpansionChange(0)
            // Reset hand position to center
            onHandPosition(0, 0)
        }
      }
      
      animationFrameId = requestAnimationFrame(predictWebcam)
    }

    setupHandLandmarker()

    return () => {
      isActive = false
      cancelAnimationFrame(animationFrameId)
      if (handLandmarker) handLandmarker.close()
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onExpansionChange, onSwipe, onHandPosition])

  return (
    <>
      <video ref={videoRef} className="input_video" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="input_canvas" />
      {!isLoaded && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
          Loading Hand Tracking...
        </div>
      )}
    </>
  )
}
