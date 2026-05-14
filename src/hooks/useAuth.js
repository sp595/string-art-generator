import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider, isConfigured } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) return

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!isConfigured) return
    await signInWithPopup(auth, googleProvider)
  }

  const signOutUser = async () => {
    if (!isConfigured) return
    await signOut(auth)
  }

  return { user, loading, signInWithGoogle, signOutUser, isConfigured }
}
