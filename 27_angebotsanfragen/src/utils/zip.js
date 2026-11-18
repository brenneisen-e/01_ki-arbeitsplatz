/** Kleiner ZIP-Schreiber ohne Kompression (STORE), für den Export der Demo-Eingänge. */

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

export function createZip(files) {
  const enc = new TextEncoder()
  const entries = []
  let offset = 0

  for (const f of files) {
    const nameBytes = enc.encode(f.name)
    const data = typeof f.content === 'string' ? enc.encode(f.content) : f.content
    const crc = crc32(data)

    const lh = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(lh.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true) // Dateiname in UTF-8
    lv.setUint16(8, 0, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, nameBytes.length, true)
    lh.set(nameBytes, 30)

    const ch = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(ch.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(10, 0, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(38, 0x20, true)
    cv.setUint32(42, offset, true)
    ch.set(nameBytes, 46)

    entries.push({ lh, data, ch })
    offset += lh.length + data.length
  }

  const centralSize = entries.reduce((s, e) => s + e.ch.length, 0)
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)

  const result = new Uint8Array(offset + centralSize + 22)
  let pos = 0
  for (const e of entries) { result.set(e.lh, pos); pos += e.lh.length; result.set(e.data, pos); pos += e.data.length }
  for (const e of entries) { result.set(e.ch, pos); pos += e.ch.length }
  result.set(eocd, pos)
  return result
}
