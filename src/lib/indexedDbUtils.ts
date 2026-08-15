export const getLatestSharedImage = async (): Promise<File | undefined> => {
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

    return file
  } catch (error) {
    console.error('Error reading shared file from IndexedDB:', error)
    return undefined
  }
}
