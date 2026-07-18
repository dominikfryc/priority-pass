import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { Home } from './pages/Home'
import { PassDetail } from './pages/PassDetail'
import { usePassStore } from './store/usePassStore'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/pass/:id',
    element: <PassDetail />,
  },
])

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('shared') === 'true') {
      const loadShared = async () => {
        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('PriorityPassShared', 1)
            request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
            request.onerror = () => reject(request.error || new Error('Unknown IndexedDB error'))
          })

          const file = await new Promise<File | undefined>((resolve, reject) => {
            const tx = db.transaction('shared-files', 'readwrite')
            const store = tx.objectStore('shared-files')
            const req = store.get('latest-shared-image')
            req.onsuccess = () => {
              // Delete it so it doesn't get processed again on reload
              store.delete('latest-shared-image')
              resolve(req.result as File | undefined)
            }
            req.onerror = () => reject(req.error || new Error('Failed to get shared file'))
          })

          if (file) {
            usePassStore.getState().setSharedFile(file)
            // Remove the query param without reloading
            window.history.replaceState({}, '', '/')
          }
        } catch (error) {
          console.error(error)
        }
      }
      void loadShared()
    }
  }, [])

  return (
    <div className="max-w-md mx-auto w-full">
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
