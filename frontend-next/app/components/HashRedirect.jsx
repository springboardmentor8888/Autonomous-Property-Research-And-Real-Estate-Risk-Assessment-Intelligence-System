'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HashRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (window.location.hash === '#about') {
      router.replace('/we-are')
    } else if (window.location.hash === '#property-search') {
      router.replace('/property-search')
    }
    
    // Also listen for hash changes in case it happens after load
    const handleHashChange = () => {
      if (window.location.hash === '#about') {
        router.replace('/we-are')
      } else if (window.location.hash === '#property-search') {
        router.replace('/property-search')
      }
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [router])

  return null
}
