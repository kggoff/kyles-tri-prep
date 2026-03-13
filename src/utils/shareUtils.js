export async function encodeShareData(entries, activityTypes, raceDate) {
  const data = JSON.stringify({ entries, activityTypes, raceDate })
  const bytes = new TextEncoder().encode(data)

  const cs = new CompressionStream('gzip')
  const writer = cs.writable.getWriter()
  writer.write(bytes)
  writer.close()

  const chunks = []
  const reader = cs.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const compressed = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    compressed.set(chunk, offset)
    offset += chunk.length
  }

  // base64url encode
  let b64 = btoa(String.fromCharCode(...compressed))
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return b64
}

export async function decodeShareData(hash) {
  if (!hash || !hash.startsWith('#data=')) return null
  try {
    let b64 = hash.slice(6)
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='

    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const ds = new DecompressionStream('gzip')
    const writer = ds.writable.getWriter()
    writer.write(bytes)
    writer.close()

    const chunks = []
    const reader = ds.readable.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const decompressed = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      decompressed.set(chunk, offset)
      offset += chunk.length
    }

    const json = new TextDecoder().decode(decompressed)
    return JSON.parse(json)
  } catch (e) {
    console.warn('Failed to decode share data:', e)
    return null
  }
}
