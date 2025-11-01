/**
 * Hook for sequential scroll-triggered animations
 * Animates elements as they come into view with staggered timing
 */
import { useEffect, useRef, useState } from 'react'

export function useSequentialAnimation<T extends HTMLElement>() {
  const [isContainerVisible, setIsContainerVisible] = useState(false)
  const containerRef = useRef<T>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContainerVisible(true)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return {
    containerRef,
    isContainerVisible,
  }
}