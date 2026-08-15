import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { Home } from './pages/Home'
import { PassDetail } from './pages/PassDetail'
import { usePassStore } from './store/usePassStore'
import { getLatestSharedImage } from './lib/indexedDbUtils'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/pass/:id',
      element: <PassDetail />,
    },
  ],
  {
    basename: import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
)

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('shared') === 'true') {
      const loadShared = async () => {
        const file = await getLatestSharedImage()
        if (file) {
          usePassStore.getState().setSharedFile(file)
          // Remove the query param without reloading
          window.history.replaceState({}, '', import.meta.env.BASE_URL)
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
