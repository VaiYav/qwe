import { useEffect, useState } from 'react'

export const isBrowser = typeof window !== 'undefined'

export const useMedia = (query: string, defaultState = false) => {
  const [state, setState] = useState(
    isBrowser ? () => window.matchMedia(query).matches : defaultState,
  )

  useEffect(() => {
    let mounted = true
    const mql = window.matchMedia(query)
    const onChange = () => {
      if (!mounted) {
        return
      }
      setState(!!mql.matches)
    }

    mql.addListener(onChange)
    setState(mql.matches)

    return () => {
      mounted = false
      mql.removeListener(onChange)
    }
  }, [query])

  return state
}
