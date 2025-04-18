export {};

declare global {
  interface FileSystemDirectoryHandle {
    values(): AsyncIterable<FileSystemHandle>;
  }
}
