import { useRef, useCallback } from 'react'

/**
 * Hook to use Web Worker for string art generation
 */
export function useStringArtWorker() {
  const workerRef = useRef(null)

  const generateWithWorker = useCallback((image, parameters, onProgress) => {
    return new Promise((resolve, reject) => {
      // Create canvas to get image data
      const canvas = document.createElement('canvas')
      canvas.width = parameters.imageSize
      canvas.height = parameters.imageSize
      const ctx = canvas.getContext('2d')

      ctx.drawImage(image, 0, 0, parameters.imageSize, parameters.imageSize)
      const imageData = ctx.getImageData(0, 0, parameters.imageSize, parameters.imageSize).data

      // Create worker
      const worker = new Worker(
        new URL('../workers/stringArtWorker.js', import.meta.url),
        { type: 'module' }
      )

      workerRef.current = worker

      // Handle messages from worker
      worker.onmessage = (e) => {
        const { type, progress, result } = e.data

        if (type === 'progress') {
          onProgress?.(progress)
        } else if (type === 'complete') {
          worker.terminate()
          workerRef.current = null
          resolve(result)
        }
      }

      worker.onerror = (error) => {
        worker.terminate()
        workerRef.current = null
        reject(error)
      }

      // Send data to worker
      worker.postMessage({
        imageData: Array.from(imageData), // Convert to regular array for transfer
        parameters
      })
    })
  }, [])

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return { generateWithWorker, terminateWorker }
}
