import { useRef, useEffect, useState, useCallback } from 'react'
import './NeuralViz.css'

const COLORS = {
  bg: '#0a0a1a',
  node: '#00d4ff',
  nodeGlow: 'rgba(0, 212, 255, 0.3)',
  connection: 'rgba(0, 212, 255, 0.12)',
  pulse: '#00ff88',
  pulseAlt: '#ff6b00',
  accent: '#7c3aed',
  text: '#e0e0ff',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
}

function lerp(a, b, t) { return a + (b - a) * t }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }
function rand(min, max) { return Math.random() * (max - min) + min }

class Node {
  constructor(x, y, layer = -1) {
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.radius = rand(4, 8)
    this.layer = layer
    this.activation = 0
    this.phase = rand(0, Math.PI * 2)
    this.connections = []
    this.pulseTimer = 0
    this.hovered = false
  }

  update(time) {
    this.x = lerp(this.x, this.targetX, 0.02)
    this.y = lerp(this.y, this.targetY, 0.02)
    this.activation = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.002 + this.phase))
    if (this.pulseTimer > 0) this.pulseTimer -= 0.016
  }

  draw(ctx) {
    const glow = this.hovered ? 30 : 15
    const r = this.hovered ? this.radius * 1.5 : this.radius

    ctx.save()
    ctx.shadowBlur = glow
    ctx.shadowColor = this.pulseTimer > 0 ? COLORS.pulse : COLORS.node
    ctx.beginPath()
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2)
    ctx.fillStyle = this.pulseTimer > 0
      ? COLORS.pulse
      : `rgba(0, 212, 255, ${0.4 + this.activation * 0.6})`
    ctx.fill()

    // Inner bright core
    ctx.beginPath()
    ctx.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.6 + this.activation * 0.4
    ctx.fill()
    ctx.restore()
  }
}

class Pulse {
  constructor(from, to, color = COLORS.pulse) {
    this.from = from
    this.to = to
    this.t = 0
    this.speed = rand(0.008, 0.025)
    this.color = color
    this.alive = true
    this.size = rand(2, 4)
  }

  update() {
    this.t += this.speed
    if (this.t >= 1) {
      this.alive = false
      this.to.pulseTimer = 0.3
    }
  }

  draw(ctx) {
    const x = lerp(this.from.x, this.to.x, this.t)
    const y = lerp(this.from.y, this.to.y, this.t)
    ctx.save()
    ctx.shadowBlur = 12
    ctx.shadowColor = this.color
    ctx.beginPath()
    ctx.arc(x, y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()

    // Trail
    const trailLen = 5
    for (let i = 1; i <= trailLen; i++) {
      const tt = Math.max(0, this.t - i * 0.015)
      const tx = lerp(this.from.x, this.to.x, tt)
      const ty = lerp(this.from.y, this.to.y, tt)
      ctx.beginPath()
      ctx.arc(tx, ty, this.size * (1 - i / trailLen), 0, Math.PI * 2)
      ctx.globalAlpha = 0.5 * (1 - i / trailLen)
      ctx.fill()
    }
    ctx.restore()
  }
}

function buildNetwork(w, h) {
  const nodes = []
  const layers = 6
  const nodesPerLayer = [4, 6, 8, 8, 6, 3]
  const layerSpacing = w / (layers + 1)

  for (let l = 0; l < layers; l++) {
    const count = nodesPerLayer[l]
    const layerHeight = h * 0.7
    const startY = (h - layerHeight) / 2
    for (let n = 0; n < count; n++) {
      const x = layerSpacing * (l + 1) + rand(-20, 20)
      const y = startY + (layerHeight / (count + 1)) * (n + 1) + rand(-10, 10)
      const node = new Node(x, y, l)
      nodes.push(node)
    }
  }

  // Connect adjacent layers
  for (const node of nodes) {
    const nextLayer = nodes.filter(n => n.layer === node.layer + 1)
    for (const target of nextLayer) {
      if (Math.random() < 0.6) {
        node.connections.push(target)
      }
    }
    // Ensure at least one connection forward
    if (nextLayer.length > 0 && node.connections.filter(c => c.layer === node.layer + 1).length === 0) {
      node.connections.push(nextLayer[Math.floor(Math.random() * nextLayer.length)])
    }
  }

  return nodes
}

export default function NeuralViz() {
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const pulsesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const statsRef = useRef({ fps: 0, pulsesSent: 0, dataProcessed: 0, throughput: 0 })
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())
  const animRef = useRef(null)
  const [stats, setStats] = useState({ fps: 0, nodes: 0, connections: 0, pulsesSent: 0, throughput: '0 KB/s' })
  const [autoMode, setAutoMode] = useState(true)
  const [showHelp, setShowHelp] = useState(true)

  const spawnPulse = useCallback(() => {
    const nodes = nodesRef.current
    const eligible = nodes.filter(n => n.connections.length > 0)
    if (eligible.length === 0) return
    const source = eligible[Math.floor(Math.random() * eligible.length)]
    const target = source.connections[Math.floor(Math.random() * source.connections.length)]
    const color = Math.random() > 0.3 ? COLORS.pulse : COLORS.pulseAlt
    pulsesRef.current.push(new Pulse(source, target, color))
    statsRef.current.pulsesSent++
    statsRef.current.dataProcessed += Math.floor(rand(128, 2048))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      if (nodesRef.current.length === 0) {
        nodesRef.current = buildNetwork(w, h)
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let lastAutoSpawn = 0

    function animate(time) {
      ctx.fillStyle = COLORS.bg
      ctx.fillRect(0, 0, w, h)

      // Background grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      const nodes = nodesRef.current
      const pulses = pulsesRef.current

      // Hover detection
      for (const node of nodes) {
        node.hovered = dist(node, mouseRef.current) < 30
      }

      // Draw connections
      for (const node of nodes) {
        for (const target of node.connections) {
          const d = dist(node, target)
          const alpha = Math.max(0.03, 0.15 - d / 2000)
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`
          ctx.lineWidth = node.hovered || target.hovered ? 2 : 0.8
          ctx.stroke()
        }
      }

      // Update & draw nodes
      for (const node of nodes) {
        node.update(time)
        node.draw(ctx)
      }

      // Update & draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update()
        if (!pulses[i].alive) {
          // Chain reaction: propagate pulse forward
          const target = pulses[i].to
          if (target.connections.length > 0 && Math.random() < 0.7) {
            const next = target.connections[Math.floor(Math.random() * target.connections.length)]
            pulses.push(new Pulse(target, next, pulses[i].color))
            statsRef.current.pulsesSent++
            statsRef.current.dataProcessed += Math.floor(rand(64, 512))
          }
          pulses.splice(i, 1)
        } else {
          pulses[i].draw(ctx)
        }
      }

      // Auto-spawn pulses
      if (autoMode && time - lastAutoSpawn > 200) {
        lastAutoSpawn = time
        for (let i = 0; i < 3; i++) spawnPulse()
      }

      // FPS
      frameCountRef.current++
      if (time - lastFpsTimeRef.current > 1000) {
        const fps = Math.round(frameCountRef.current * 1000 / (time - lastFpsTimeRef.current))
        frameCountRef.current = 0
        lastFpsTimeRef.current = time
        const throughputNum = statsRef.current.dataProcessed
        const throughputStr = throughputNum > 1048576
          ? `${(throughputNum / 1048576).toFixed(1)} MB/s`
          : `${(throughputNum / 1024).toFixed(1)} KB/s`
        statsRef.current.dataProcessed = 0

        setStats({
          fps,
          nodes: nodes.length,
          connections: nodes.reduce((sum, n) => sum + n.connections.length, 0),
          pulsesSent: statsRef.current.pulsesSent,
          throughput: throughputStr,
        })
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [autoMode, spawnPulse])

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newNode = new Node(x, y, -1)
    const nodes = nodesRef.current

    // Connect to nearest nodes
    const sorted = [...nodes].sort((a, b) => dist(a, { x, y }) - dist(b, { x, y }))
    const nearby = sorted.slice(0, Math.min(4, sorted.length))
    for (const n of nearby) {
      if (dist(n, { x, y }) < 300) {
        newNode.connections.push(n)
        n.connections.push(newNode)
      }
    }

    nodes.push(newNode)

    // Fire some pulses from the new node
    for (const target of newNode.connections) {
      pulsesRef.current.push(new Pulse(newNode, target, COLORS.accent))
      statsRef.current.pulsesSent++
    }

    setShowHelp(false)
  }

  const handleMouseMove = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleBurst = () => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => spawnPulse(), i * 50)
    }
  }

  const handleReset = () => {
    const canvas = canvasRef.current
    nodesRef.current = buildNetwork(canvas.width, canvas.height)
    pulsesRef.current = []
    statsRef.current.pulsesSent = 0
  }

  return (
    <div className="neuralViz">
      <canvas
        ref={canvasRef}
        className="neuralCanvas"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />

      {/* Title */}
      <div className="nv-title">
        <h1>NEURAL<span className="nv-accent">FLOW</span></h1>
        <p className="nv-subtitle">Real-Time Network Visualization</p>
      </div>

      {/* Stats Panel */}
      <div className="nv-panel nv-stats">
        <h3 className="nv-panelTitle">Network Metrics</h3>
        <div className="nv-statGrid">
          <div className="nv-stat">
            <span className="nv-statValue">{stats.fps}</span>
            <span className="nv-statLabel">FPS</span>
          </div>
          <div className="nv-stat">
            <span className="nv-statValue">{stats.nodes}</span>
            <span className="nv-statLabel">Nodes</span>
          </div>
          <div className="nv-stat">
            <span className="nv-statValue">{stats.connections}</span>
            <span className="nv-statLabel">Synapses</span>
          </div>
          <div className="nv-stat">
            <span className="nv-statValue">{stats.pulsesSent.toLocaleString()}</span>
            <span className="nv-statLabel">Signals Sent</span>
          </div>
        </div>
        <div className="nv-throughput">
          <span className="nv-throughputLabel">Throughput</span>
          <span className="nv-throughputValue">{stats.throughput}</span>
        </div>
        <div className="nv-bar">
          <div
            className="nv-barFill"
            style={{ width: `${Math.min(100, stats.fps * 1.67)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="nv-panel nv-controls">
        <h3 className="nv-panelTitle">Controls</h3>
        <button
          className={`nv-btn ${autoMode ? 'nv-btnActive' : ''}`}
          onClick={() => setAutoMode(!autoMode)}
        >
          {autoMode ? '⏸ Pause Sim' : '▶ Start Sim'}
        </button>
        <button className="nv-btn nv-btnBurst" onClick={handleBurst}>
          ⚡ Signal Burst
        </button>
        <button className="nv-btn" onClick={handleReset}>
          ↺ Reset Network
        </button>
      </div>

      {/* Activity Log */}
      <div className="nv-panel nv-activity">
        <h3 className="nv-panelTitle">Activity</h3>
        <div className="nv-activityBar">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="nv-activityCol"
              style={{
                height: `${20 + Math.random() * 80}%`,
                opacity: 0.3 + (i / 30) * 0.7,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Help Toast */}
      {showHelp && (
        <div className="nv-help">
          Click anywhere to add nodes &middot; Hover to inspect &middot; Watch data flow in real-time
        </div>
      )}

      {/* Back button */}
      <a href="/" className="nv-back">&larr; Back</a>
    </div>
  )
}
