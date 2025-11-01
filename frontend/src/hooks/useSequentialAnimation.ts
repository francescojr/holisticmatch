/**
 * Hook for sequential scroll-triggered animations
 * Animates elements as they come into view with staggered timing
 */
import { useEffect, useRef, useState } from 'react'

export function useSequentialAnimation<T extends HTMLElement>() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<T>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = itemRefs.current.findIndex(ref => ref === entry.target)
          if (entry.isIntersecting && index !== -1 && !visibleItems.has(index)) {
            // Add item to visible set immediately when it comes into view
            setVisibleItems(prev => new Set([...prev, index]))
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger when item is 100px from bottom
        threshold: 0.1,
      }
    )

    // Observe all item refs
    itemRefs.current.forEach((itemRef) => {
      if (itemRef) observer.observe(itemRef)
    })

    return () => observer.disconnect()
  }, [visibleItems])

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