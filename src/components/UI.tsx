import { type ShapeType, type ViewMode } from '../App'
import { Palette, Hand, Heart, Flower, Rocket, Orbit, Sparkles, Sun, LayoutGrid } from 'lucide-react'

interface UIProps {
  currentShape: ShapeType
  setShape: (shape: ShapeType) => void
  currentColor: string
  setColor: (color: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function UI({ currentShape, setShape, currentColor, setColor, viewMode, setViewMode }: UIProps) {
  // Version tracker - update this with each change
  const VERSION = "v3.1.0 - Showcase Mode!"
  const TIMESTAMP = "Dec 24, 2025 - 02:00"

  const shapes: { id: ShapeType; icon: React.ReactNode; label: string }[] = [
    { id: 'heart', icon: <Heart size={20} />, label: 'Heart' },
    { id: 'flower', icon: <Flower size={20} />, label: 'Flower' },
    { id: 'saturn', icon: <Orbit size={20} />, label: 'Saturn' },
    { id: 'buddha', icon: <Hand size={20} />, label: 'Buddha' }, // Hand icon as proxy
    { id: 'fireworks', icon: <Rocket size={20} />, label: 'Fireworks' },
    { id: 'solarsystem', icon: <Sparkles size={20} />, label: 'Galaxy' },
    { id: 'realsolar', icon: <Sun size={20} />, label: 'Solar System' },
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
        {currentShape === 'realsolar' && viewMode === 'showcase' ? (
          <>
            <p>🌍 <b>Showcase Mode</b> - All planets displayed</p>
            <p>🎹 <b>Press M</b> to return to Solar System</p>
            <p style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>💡 Review each planet's appearance</p>
          </>
        ) : currentShape === 'realsolar' ? (
          <>
            <p>✋ <b>ONE hand left/right/up/down</b> → Fly that direction</p>
            <p>🤲 <b>TWO hands apart</b> → Fly forward</p>
            <p>🤲 <b>TWO hands together</b> → Fly backward</p>
            <p>🎹 <b>Press M</b> to enter Showcase Mode</p>
            <p style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>💡 Camera rotates to face flight direction</p>
          </>
        ) : currentShape === 'solarsystem' ? (
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
      
      {/* Showcase Mode Toggle Button (only show in Solar System mode) */}
      {currentShape === 'realsolar' && (
        <div style={{ position: 'absolute', top: 140, right: 40 }}>
          <button
            onClick={() => setViewMode(viewMode === 'normal' ? 'showcase' : 'normal')}
            style={{
              background: viewMode === 'showcase' ? 'rgba(255,200,0,0.3)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '12px 16px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              fontWeight: 600
            }}
          >
            <LayoutGrid size={20} />
            <span>{viewMode === 'showcase' ? 'Normal View' : 'Showcase Mode'}</span>
          </button>
        </div>
      )}
      
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



