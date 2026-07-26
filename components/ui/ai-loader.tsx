'use client'

import { useEffect, useState } from 'react'

const loadingMessages = [
  'Understanding your expense',
  'Extracting the amount',
  'Finding the merchant',
  'Categorizing your purchase',
  'Refining the description',
]

export default function AILoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full">

      <div className="orb-wrapper">

        <div className="orb-bloom" />

        <div className="orb-light" />

        <div className="orb" />

      </div>

      <div className="mb-10 md:mb-0">
      <div className="text-center">
        <p
          key={index}
          className="animate-message text-4xl px-10 md:px-0 mb-3 md:text-5xl md:mx-auto"
        >
          {loadingMessages[index]}
        </p>
      </div>
      <p className="text-sm md:text-lg text-white/70 text-center">
        AI is analyzing your expense
      </p>
    </div>
    </div>
  )
}