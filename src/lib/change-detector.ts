import fs from "fs"
import path from "path"
import crypto from "crypto"
import { CrawlHash } from "./types"

const DATA_DIR = path.join(process.cwd(), ".data")
const HASH_FILE = path.join(DATA_DIR, "crawl-hashes.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readHashes(): CrawlHash[] {
  ensureDir()
  if (!fs.existsSync(HASH_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(HASH_FILE, "utf-8"))
  } catch {
    return []
  }
}

function writeHashes(hashes: CrawlHash[]) {
  ensureDir()
  fs.writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2))
}

export const changeDetector = {
  check(url: string, content: string): { changed: boolean; previousHash?: string } {
    const hashes = readHashes()
    const newHash = crypto.createHash("sha256").update(content).digest("hex")
    const existing = hashes.find(h => h.url === url)

    if (!existing) {
      hashes.push({ url, hash: newHash, lastChecked: new Date().toISOString(), changed: false })
      writeHashes(hashes)
      return { changed: false }
    }

    const changed = existing.hash !== newHash
    existing.hash = newHash
    existing.lastChecked = new Date().toISOString()
    existing.changed = changed
    writeHashes(hashes)

    return { changed, previousHash: changed ? existing.hash : undefined }
  },

  getChanged(): CrawlHash[] {
    return readHashes().filter(h => h.changed)
  },

  getAll(): CrawlHash[] {
    return readHashes()
  },

  clear(url?: string) {
    if (url) {
      const hashes = readHashes().filter(h => h.url !== url)
      writeHashes(hashes)
    } else {
      writeHashes([])
    }
  },
}
