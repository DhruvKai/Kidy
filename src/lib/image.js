// Resize + compress an uploaded photo in the browser, the way the real admin would on upload.
export function compressImage(file, maxDim = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const image = new Image()
      image.onerror = reject
      image.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(image.width, image.height))
        const w = Math.round(image.width * scale)
        const h = Math.round(image.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(image, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve({
          dataUrl, width: w, height: h,
          originalBytes: file.size,
          compressedBytes: Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75),
          name: file.name,
        })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
