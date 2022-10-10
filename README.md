# @textland/simple-fs

This is a dead-simple artificial "filesystem" implemented over LevelDB. It's
intended for use in a multi-user system, so it allows for (and requires)
namespacing by user.

The following quirks apply:

* Directories don't actually exist. Only files exist as entries in LevelDB. This
  means directories don't have to be created to be used.
* Only one process may access the filesystem at a time.
* Entire files are read in and written as single buffers. There is no "append"
  or streaming of files.

The default export is the `FileSystem` class. `UserFileSystem` is also
exported.

## API

### `FileSystem`

* **`constructor(path: string)`**: The constructor accepts a single argument, `path`,
  which is passed as the first argument to the
  [`Level`](https://www.npmjs.com/package/level) constructor. This should be the
  location of your LevelDB on your local (real) filesystem.

* **`createUserFileSystem(username: string): UserFileSystem`**: Creates an instance of `UserFileSystem`,
  with `username` as the namespace.

### `UserFileSystem`

* **`constructor(username: string, fs: FileSystem)`**: The constructor should not be used, in favour
  of `FileSystem#createUserFileSystem`. If it _is_ used, the first parameter is
  the namespace (i.e. username), and the second parameter is an instance of
  `FileSystem`.
* **propery `cwd: string`**: Use this to set or read the current working directory for relative
  paths.
* **`deleteFile(path: string): Promise`**: Deletes the file at the path in the namespace. If not absolute, then relative to the `cwd`. Resolves when complete.
* **`readFile(path: string): Promise<Buffer>`**: Reads the file at the path in
  the namespac. If not absolute, then relative to the `cwd`.
* **`writeFile(path: string, content: string|Buffer): Promise`**: Writes the
  file at the path in the namespace with the given content, overwriting if it
  already exists. If not aboslute, then relative to the `cwd`. Resolves when
  complete.
* **`readdir(path: string): Promise<Array<string>>`**: Reads a directory,
  resolving an array of all files with the given path as a prefix, trimming the
  prefix. Note that this means any files in "subdirectories" will also be
  included.

## License

ISC License. See LICENSE.txt
