import { Level } from 'level'
import { normalize } from 'path'

export default class FileSystem {
  constructor (path) {
    this.db = new Level(path, { valueEncoding: 'buffer' })

    this.destroy = () => {
      if (this.destroyed) return
      this.db.close()
      process.removeListener('beforeExit', this.destroy)
      this.destroyed = true
    }

    process.on('beforeExit', this.destroy)
  }

  createUserFileSystem (username) {
    return new UserFileSystem(username, this)
  }
}

export class UserFileSystem {
  constructor (username, fs) {
    this.username = username
    this.fs = fs
    this.cwd = '/'
  }

  normalizePath (path) {
    return normalize(path.startsWith('/') ? path : this.cwd + '/' + path)
  }

  readFile (path) {
    path = this.normalizePath(path)
    return this.fs.db.get(this.username + ':' + path)
  }

  writeFile (path, content) {
    path = this.normalizePath(path)
    return this.fs.db.put(this.username + ':' + path, content)
  }

  deleteFile (path) {
    path = this.normalizePath(path)
    return this.fs.db.del(this.username + ':' + path)
  }

  async readdir (path) {
    const result = new Set()
    const dir = this.username + ':' + this.normalizePath(path)
    const iter = this.fs.db.iterator({
      keys: true,
      values: false
    })
    for await (const [key] of iter) {
      if (key.startsWith(dir)) {
        result.add(key.replace(dir + '/', '').replace(/\/.*/, '/'))
      }
    }
    return result
  }
}
