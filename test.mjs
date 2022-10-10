import { describe, it } from 'node:test'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import assert from 'assert'

import FileSystem from './index.mjs'

const buf = Buffer.from('some text')

describe('simple-fs', () => {
  let tmpdir
  let simpleFs

  it('create tmpdir', async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'simple-fs-'))
  })

  it('create fs', () => {
    simpleFs = new FileSystem(tmpdir)
  })

  describe('user fs', () => {
    let userFs

    it('create', () => {
      userFs = simpleFs.createUserFileSystem('aliceorbob')
    })

    it('writeFile', async () => {
      await userFs.writeFile('files/foo.txt', 'some text')
    })

    it('readFile', async () => {
      assert.deepEqual(
        await userFs.readFile('files/foo.txt'),
        buf
      )
    })

    it('writeFile buffer', async () => {
      await userFs.writeFile('files/foo2.txt', buf)
    })

    it('readFile buffer', async () => {
      assert.deepEqual(
        await userFs.readFile('files/foo2.txt'),
        buf
      )
    })

    describe('with cwd', () => {
      it('writeFile', async () => {
        userFs.cwd = '/files'
        await userFs.writeFile('foo3.txt', 'some text')
      })

      it('readFile', async () => {
        assert.deepEqual(
          await userFs.readFile('/files/foo3.txt'),
          buf
        )
        userFs.cwd = '/'
      })
    })

    it('deleteFile', async () => {
      await userFs.deleteFile('/files/foo3.txt')
    })

    it('readdir', async () => {
      const dir = await userFs.readdir('files')
      assert.ok(dir instanceof Set)
      assert.deepEqual(Array.from(dir), ['foo.txt', 'foo2.txt'])
    })
  })

  it('destroy fs', () => {
    simpleFs.destroy()
    simpleFs.destroy()
  })

  it('cleanup', async () => {
    await fs.rm(tmpdir, { recursive: true })
  })
})
