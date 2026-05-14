import { useState, useCallback } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore'
import { db, isConfigured } from '../firebase'

const LS_KEY = 'string-art-saves'
const MAX_LOCAL_SAVES = 5

function readLocalSaves() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalSaves(saves) {
  localStorage.setItem(LS_KEY, JSON.stringify(saves))
}

function makePayload(result, currentLine, name) {
  return {
    name: name || `Sessione ${new Date().toLocaleString('it-IT')}`,
    savedAt: new Date().toISOString(),
    currentLine,
    lineSequence: result.lineSequence,
    pinCoords: result.pinCoords,
    startPin: result.startPin ?? 0,
    parameters: result.parameters,
    rendering: result.rendering
  }
}

export function useCloudSave(user) {
  const [saves, setSaves] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const refreshSaves = useCallback(async () => {
    if (isConfigured && user) {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'saves'),
          where('uid', '==', user.uid),
          orderBy('savedAt', 'desc')
        )
        const snap = await getDocs(q)
        setSaves(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } finally {
        setLoading(false)
      }
    } else {
      setSaves(readLocalSaves())
    }
  }, [user])

  const saveProgress = useCallback(async (result, currentLine, name) => {
    setSaving(true)
    try {
      const payload = makePayload(result, currentLine, name)

      if (isConfigured && user) {
        await addDoc(collection(db, 'saves'), { ...payload, uid: user.uid })
      } else {
        const local = readLocalSaves()
        local.unshift({ id: Date.now().toString(), ...payload })
        writeLocalSaves(local.slice(0, MAX_LOCAL_SAVES))
      }

      await refreshSaves()
    } finally {
      setSaving(false)
    }
  }, [user, refreshSaves])

  const updateProgress = useCallback(async (saveId, currentLine) => {
    if (isConfigured && user) {
      await updateDoc(doc(db, 'saves', saveId), { currentLine, updatedAt: new Date().toISOString() })
    } else {
      const local = readLocalSaves()
      const idx = local.findIndex(s => s.id === saveId)
      if (idx !== -1) {
        local[idx] = { ...local[idx], currentLine }
        writeLocalSaves(local)
      }
    }
  }, [user])

  const deleteSave = useCallback(async (saveId) => {
    if (isConfigured && user) {
      await deleteDoc(doc(db, 'saves', saveId))
    } else {
      const local = readLocalSaves()
      writeLocalSaves(local.filter(s => s.id !== saveId))
    }
    await refreshSaves()
  }, [user, refreshSaves])

  return { saves, saving, loading, saveProgress, updateProgress, deleteSave, refreshSaves }
}
