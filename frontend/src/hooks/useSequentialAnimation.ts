/**
 * Hook for sequential scroll-triggered animations
 * Animates elements as they come into view with staggered timing
 */
import { useEffect, useRef, useState } from 'react'

export function useSequentialAnimation<T extends HTMLElement>() {
  const [isContainerVisible, setIsContainerVisible] = useState(true) // Start as visible
  const containerRef = useRef<T>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check if container is already in viewport on mount
    const rect = container.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (isInViewport) {
      setIsContainerVisible(true)
    }

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