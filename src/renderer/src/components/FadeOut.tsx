import { useState, useEffect } from 'react'

type FadeOutProps = {
  children: React.ReactNode
  time: number
}

const FadeOut = ({ children, time }: FadeOutProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, time)

    return () => clearTimeout(timer)
  }, [time])

  const handleTransitionEnd = () => {
    if (!isVisible) {
      setShouldRender(false)
    }
  }

  if (!shouldRender) return null

  return (
    <div
      className="transition-all duration-500 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        maxHeight: isVisible ? '1000px' : '0',
        overflow: 'hidden'
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  )
}

export default FadeOut
