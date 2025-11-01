/**
 * Hook for sequential scroll-triggered animations
 * Animates elements as they come into view with staggered timing
 */
import { useEffect, useRef, useState } from 'react'

export function useSequentialAnimation<T extends HTMLElement>(
  totalItems: number,
  staggerDelay: number = 0.1
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<T>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !visibleItems.has(index)) {
            // Add item to visible set with staggered delay
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]))
            }, index * staggerDelay * 1000)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Trigger when item is 50px from bottom
        threshold: 0.1,
      }
    )

    // Observe all item refs
    itemRefs.current.forEach((itemRef) => {
      if (itemRef) observer.observe(itemRef)
    })

    return () => observer.disconnect()
  }, [totalItems, staggerDelay, visibleItems])

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el
  }

  const isItemVisible = (index: number) => visibleItems.has(index)

  return {
    containerRef,
    setItemRef,
    isItemVisible,
  }
}