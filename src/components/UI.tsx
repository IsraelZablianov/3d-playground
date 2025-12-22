import { type ShapeType } from '../App'
import { HexColorPicker } from "react-colorful" // I need to install this or build a simple one
import { Palette, Hand, Heart, Flower, Rocket, Orbit, Galaxy } from 'lucide-react'
import { useState } from 'react'

// I will assume I need to install react-colorful or just use a standard input type color for simplicity first, 
// but user asked for "modern" so a custom one is better. I'll stick to input type color for now to save deps or add it.
// Actually, I'll use a simple list of preset colors + native picker.

interface UIProps {
  currentShape: ShapeType
  setShape: (shape: ShapeType) => void
  currentColor: string
  setColor: (color: string) => void
}

export function UI({ currentShape, setShape, currentColor, setColor }: UIProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  // Version tracker - update this with each change
  const VERSION = "v1.1.0 - Added Solar System (Galaxy) mode with hand movement"
  const TIMESTAMP = "Dec 23, 2025 - 23:15"

  const shapes: { id: ShapeType; icon: React.ReactNode; label: string }[] = [
    { id: 'heart', icon: <Heart size={20} />, label: 'Heart' },
    { id: 'flower', icon: <Flower size={20} />, label: 'Flower' },
    { id: 'saturn', icon: <Orbit size={20} />, label: 'Saturn' },
    { id: 'buddha', icon: <Hand size={20} />, label: 'Buddha' }, // Hand icon as proxy
    { id: 'fireworks', icon: <Rocket size={20} />, label: 'Fireworks' },
    { id: 'solarsystem', icon: <Galaxy size={20} />, label: 'Galaxy' },
  ]

  return (
    <div className="ui-container">
      {/* Shape Selector */}
      <div className="ui-panel" style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16 }}>
        {shapes.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s.id)}
            style={{
              background: currentShape === s.id ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            {s.icon}
            <span style={{ fontSize: 12 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Color Selector */}
      <div className="ui-panel" style={{ position: 'absolute', top: 40, right: 40 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette size={20} color="white" />
            <span style={{ color: 'white', fontWeight: 600 }}>Color</span>
         </div>
         <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {['#ff0055', '#00ffaa', '#00aaff', '#ffaa00', '#ffffff'].map(c => (
                <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: c,
                        border: currentColor === c ? '2px solid white' : 'none',
                        cursor: 'pointer'
                    }}
                />
            ))}
            <input 
                type="color" 
                value={currentColor} 
                onChange={(e) => setColor(e.target.value)}
                style={{
                    width: 24,
                    height: 24,
                    border: 'none',
                    padding: 0,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'pointer'
                }}
            />
         </div>
      </div>
      
      {/* Instructions */}
      <div style={{ position: 'absolute', top: 40, left: 40, color: 'rgba(255,255,255,0.6)', maxWidth: 300 }}>
        <h3>Interactive Particles</h3>
        {currentShape === 'solarsystem' ? (
          <>
            <p>🌌 <b>Move hand</b> to explore galaxy</p>
            <p>👋 <b>Two hands</b> to scale</p>
          </>
        ) : (
          <>
            <p>👋 <b>Two hands</b> to scale/expand</p>
            <p>💨 <b>Swipe</b> to rotate</p>
          </>
        )}
      </div>
      
      {/* Version Tracker */}
      <div style={{ 
        position: 'absolute', 
        bottom: 40, 
        right: 40, 
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        textAlign: 'right',
        background: 'rgba(0,0,0,0.3)',
        padding: '8px 12px',
        borderRadius: 6,
        fontFamily: 'monospace'
      }}>
        <div style={{ fontWeight: 'bold', color: 'rgba(0,255,100,0.8)' }}>{VERSION}</div>
        <div style={{ marginTop: 2 }}>{TIMESTAMP}</div>
      </div>
    </div>
  )
}



