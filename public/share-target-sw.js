self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData()
          const file = formData.get('image') || formData.get('file')

          if (file && file instanceof File) {
            // Save to IndexedDB
            const db = await new Promise((resolve, reject) => {
              const request = indexedDB.open('PriorityPassShared', 1)
              request.onupgradeneeded = (e) => {
                const db = e.target.result
                if (!db.objectStoreNames.contains('shared-files')) {
                  db.createObjectStore('shared-files')
                }
              }
              request.onsuccess = (e) => resolve(e.target.result)
              request.onerror = () => reject(request.error)
            })

            await new Promise((resolve, reject) => {
              const tx = db.transaction('shared-files', 'readwrite')
              const store = tx.objectStore('shared-files')
              const req = store.put(file, 'latest-shared-image')
              req.onsuccess = () => resolve()
              req.onerror = () => reject(req.error)
            })
          }
        } catch (error) {
          console.error('Failed to parse share target request', error)
        }

        // Redirect to home page with a query parameter relative to the current base path
        const basePath = url.pathname.replace('share-target', '')
        return Response.redirect(basePath + '?shared=true', 303)
      })(),
    )
  }
})
