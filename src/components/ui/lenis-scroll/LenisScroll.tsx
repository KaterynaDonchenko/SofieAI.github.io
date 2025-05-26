'use client'

import gsap from 'gsap'
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef, ReactNode } from 'react'

interface ILenisScroll {
  children: ReactNode
}

export const LenisScroll = ({ children }: ILenisScroll) => {
  const lenisRef = useRef<any | null>(null)

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)

    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root
      options={{
        autoRaf: false,
        smoothWheel: true,
        duration: 1.2,
        lerp: 0.6
      }}
      ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}