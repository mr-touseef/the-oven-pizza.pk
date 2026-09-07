'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type FeaturedItem = {
  id: string
  name: string
  price: number
  images: [string, string, string]
}

export default function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimeout = useRef<NodeJS.Timeout | null>(null)
  const loopItems = [...items, ...items]

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let frameId: number
    const speed = 0.5

    const step = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += speed
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const handleUserInteraction = () => {
    pausedRef.current = true
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current)
    resumeTimeout.current = setTimeout(() => {
      pausedRef.current = false
    }, 2500)
  }

  return (
    <div className="w-full py-8 bg-oven-charcoal-2 relative z-10">
      <h2 className="text-2xl font-bold mb-4 px-4 text-oven-cream">Featured Products</h2>
      <div
        ref={scrollRef}
        onPointerDown={handleUserInteraction}
        onWheel={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        className="flex gap-4 overflow-x-auto px-4 pb-2 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {loopItems.map((item, i) => (
          <FeaturedCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % item.images.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [item.images.length])

  return (
    <div className="flex-shrink-0 w-[180px] h-[260px] rounded-2xl overflow-hidden shadow-md relative bg-oven-charcoal select-none">
      <div className="relative w-full h-[180px]">
        {item.images.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt={item.name}
            fill
            draggable={false}
            className={`object-cover transition-opacity duration-500 ${
              idx === imgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate text-oven-cream">{item.name}</p>
        <p className="text-oven-flame font-bold">Rs {item.price}</p>
      </div>
    </div>
  )
}
