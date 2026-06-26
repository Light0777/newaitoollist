function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items]
  const rng = mulberry32(seedFromString(seed))
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const RECENCY_HOURS = 48
export const BOOST_ZONE_SIZE = 24

export function applyRecencyBoost<T extends { created_at: string }>(
  shuffled: T[]
): T[] {
  const cutoff = Date.now() - RECENCY_HOURS * 60 * 60 * 1000
  const recent: T[] = []
  const older: T[] = []

  for (const item of shuffled) {
    if (new Date(item.created_at).getTime() > cutoff) {
      recent.push(item)
    } else {
      older.push(item)
    }
  }

  return [...recent, ...older]
}
