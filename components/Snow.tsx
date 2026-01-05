"use client"

import { useEffect, useState } from "react"

type SnowFlake = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
}

export default function Snow() {
  const [flakes, setFlakes] = useState<SnowFlake[]>([])
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // 🔹 Vérification côté client uniquement
    const month = new Date().getMonth() // 0 = janvier, 11 = décembre
    setEnabled(month === 11)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const flakeCount = 50

    const generatedFlakes: SnowFlake[] = Array.from(
      { length: flakeCount },
      (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 4,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 10,
      })
    )

    setFlakes(generatedFlakes)
  }, [enabled])

  if (!enabled || flakes.length === 0) return null

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snow"
          style={{
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
