/**
 * Minimal JSON file database utility.
 * Each collection is a .json file in /data/
 * In production, swap this for MongoDB/PostgreSQL calls.
 */
const fs   = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`)
}

function read(collection) {
  const fp = filePath(collection)
  if (!fs.existsSync(fp)) return []
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'))
  } catch {
    return []
  }
}

function write(collection, data) {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), 'utf8')
}

function findAll(collection) {
  return read(collection)
}

function findById(collection, id) {
  return read(collection).find(item => item.id === id) || null
}

function findOne(collection, predicate) {
  return read(collection).find(predicate) || null
}

function findMany(collection, predicate) {
  return read(collection).filter(predicate)
}

function insert(collection, item) {
  const data = read(collection)
  data.push(item)
  write(collection, data)
  return item
}

function update(collection, id, updates) {
  const data = read(collection)
  const idx  = data.findIndex(item => item.id === id)
  if (idx === -1) return null
  data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() }
  write(collection, data)
  return data[idx]
}

function remove(collection, id) {
  const data = read(collection)
  const idx  = data.findIndex(item => item.id === id)
  if (idx === -1) return false
  data.splice(idx, 1)
  write(collection, data)
  return true
}

module.exports = { findAll, findById, findOne, findMany, insert, update, remove, read, write }
