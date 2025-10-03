"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Star, Trophy } from "lucide-react"

interface Balloon {
  id: number
  x: number
  y: number
  color: string
  speed: number
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
}

const BALLOON_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
]

const ENCOURAGING_MESSAGES = ["Amazing!", "Great Job!", "Awesome!", "Fantastic!", "Super!", "Wonderful!", "You Rock!"]

export default function BalloonGame() {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [message, setMessage] = useState("")
  const [highScore, setHighScore] = useState(0)

  const spawnBalloon = useCallback(() => {
    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: Math.random() * 85 + 5, // 5% to 90% of screen width
      y: 110, // Start below screen
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      speed: Math.random() * 1.5 + 1.5, // Speed between 1.5 and 3
    }
    setBalloons((prev) => [...prev, newBalloon])
  }, [])

  useEffect(() => {
    if (!gameStarted) return

    const spawnInterval = setInterval(() => {
      spawnBalloon()
    }, 1200)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, spawnBalloon])

  useEffect(() => {
    if (!gameStarted) return

    const moveInterval = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((balloon) => ({
            ...balloon,
            y: balloon.y - balloon.speed,
          }))
          .filter((balloon) => balloon.y > -20),
      )
    }, 50)

    return () => clearInterval(moveInterval)
  }, [gameStarted])

  const popBalloon = (balloon: Balloon) => {
    // Remove balloon
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id))

    // Increase score
    setScore((prev) => {
      const newScore = prev + 1
      if (newScore > highScore) {
        setHighScore(newScore)
      }
      return newScore
    })

    // Show encouraging message
    const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
    setMessage(randomMessage)
    setTimeout(() => setMessage(""), 1000)

    // Create particles
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: balloon.x,
      y: balloon.y,
      color: balloon.color,
    }))
    setParticles((prev) => [...prev, ...newParticles])

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 600)
  }

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setBalloons([])
    setParticles([])
  }

  const resetGame = () => {
    setGameStarted(false)
    setScore(0)
    setBalloons([])
    setParticles([])
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-background">
      {/* Clouds decoration */}
      <div className="absolute top-10 left-10 text-6xl opacity-70">☁️</div>
      <div className="absolute top-20 right-20 text-5xl opacity-60">☁️</div>
      <div className="absolute top-40 left-1/3 text-7xl opacity-50">☁️</div>

      {/* Score display */}
      {gameStarted && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <Card className="px-8 py-4 bg-white/90 backdrop-blur shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <span className="text-3xl font-bold text-primary">{score}</span>
              </div>
              {highScore > 0 && (
                <div className="flex items-center gap-2 border-l-2 border-border pl-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-xl font-semibold text-muted-foreground">{highScore}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Encouraging message */}
      {message && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="text-5xl font-bold text-primary drop-shadow-lg flex items-center gap-2">
            <Sparkles className="w-10 h-10 text-secondary fill-secondary" />
            {message}
            <Sparkles className="w-10 h-10 text-secondary fill-secondary" />
          </div>
        </div>
      )}

      {/* Start screen */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="p-12 bg-white/95 backdrop-blur shadow-2xl max-w-md mx-4">
            <div className="text-center space-y-6">
              <div className="text-7xl mb-4">🎈</div>
              <h1 className="text-5xl font-bold text-primary mb-2">Balloon Pop!</h1>
              <p className="text-xl text-foreground leading-relaxed">Pop the balloons before they float away!</p>
              {highScore > 0 && (
                <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                  <Trophy className="w-5 h-5" />
                  <span>Best Score: {highScore}</span>
                </div>
              )}
              <Button
                onClick={startGame}
                size="lg"
                className="text-2xl px-12 py-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Playing! 🎮
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset button */}
      {gameStarted && (
        <div className="absolute top-6 right-6 z-20">
          <Button onClick={resetGame} variant="secondary" size="lg" className="text-xl px-6 py-6 font-bold shadow-lg">
            Stop Game
          </Button>
        </div>
      )}

      {/* Balloons */}
      {balloons.map((balloon) => (
        <button
          key={balloon.id}
          onClick={() => popBalloon(balloon)}
          className="absolute transition-all duration-100 hover:scale-110 cursor-pointer"
          style={{
            left: `${balloon.x}%`,
            bottom: `${balloon.y}%`,
            transform: "translate(-50%, 50%)",
          }}
          aria-label="Pop balloon"
        >
          <div className="relative animate-bounce-slow">
            {/* Balloon */}
            <div
              className="w-20 h-24 rounded-full shadow-lg"
              style={{
                backgroundColor: balloon.color,
                clipPath: "ellipse(50% 55% at 50% 45%)",
              }}
            />
            {/* String */}
            <div
              className="absolute left-1/2 top-full w-0.5 h-12 -translate-x-1/2"
              style={{ backgroundColor: balloon.color, opacity: 0.6 }}
            />
            {/* Shine effect */}
            <div
              className="absolute top-3 left-4 w-6 h-8 rounded-full bg-white/40"
              style={{ clipPath: "ellipse(50% 60% at 50% 40%)" }}
            />
          </div>
        </button>
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-particle"
          style={{
            left: `${particle.x}%`,
            bottom: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .animate-particle {
          --tx: ${Math.random() * 100 - 50}px;
          --ty: ${Math.random() * 100 - 50}px;
          animation: particle 0.6s ease-out forwards;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) translateX(-2px);
          }
          50% {
            transform: translateY(-10px) translateX(2px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
