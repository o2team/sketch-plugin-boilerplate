/**
 * File 文件操作
 * NSString.stringWithFormat('%@', content)
 */

export const File = {
  fileManager: NSFileManager.defaultManager(),

  _stringify (jsonData, opt) {
    opt = opt ? 1 : 0
    const nsJson = NSJSONSerialization.dataWithJSONObject_options_error_(jsonData, opt, nil)
    return NSString.alloc().initWithData_encoding(nsJson, 4)
  },

  writeFile (content, path) {
    content = NSString.stringWithFormat('%@', content)
    path = NSString.stringWithFormat('%@', path)
    return content.writeToFile_atomically_encoding_error_(path, !0, 4, nil)
  },

  copyFile (path, dist) {
    return this.fileManager.fileExistsAtPath(path) ? this.fileManager.copyItemAtPath_toPath_error(path, dist, nil) : nil
  },

  mkDir (path) {
    return !this.fileManager.fileExistsAtPath(path) && this.fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error_(path, !0, nil, nil)
  },

  readJSON (path, opt) {
    const src = NSData.dataWithContentsOfFile(path)
    const options = !0 === opt ? 1 : 0
    return NSJSONSerialization.JSONObjectWithData_options_error(src, options, nil)
  },

  size (patch) {
    let size = 0
    try {
      size = this.fileManager.attributesOfItemAtPath_error(patch, nil).NSFileSize
    } catch (e) {
      size = 0
    }
    return size
  },

  renameFile (from, to) {
    this.fileManager.fileExistsAtPath(from) && this.fileManager.moveItemAtPath_toPath_error(from, to, null)
  },

  exist (path) {
    return !!this.fileManager.fileExistsAtPath(path)
  },

  readDir (path) {
    return !!this.fileManager.fileExistsAtPath(path) && this.fileManager.contentsOfDirectoryAtPath_error_(path, nil)
  },

  removeDir (path) {
    this.fileManager.removeItemAtPath_error(path, null)
  },

  getTempDirPath () {
    const URL = this.fileManager.URLsForDirectory_inDomains(13, 1).lastObject()
    const hash = Date.now() / 1e3
    const nsString = NSString.stringWithFormat('%@', hash)
    return URL.URLByAppendingPathComponent(nsString).path()
  },

  mkTempDir (path) {
    const URL = this.getTempDirPath(path)
    return this.mkDir(URL) || URL
  },

  /**
   * @param {String} image
   * @param {MSImageData} image
   */
  saveImage (path, image) {
    const tiffData = image.TIFFRepresentation()
    const p = NSBitmapImageRep.imageRepWithData(tiffData)
    const data = p.representationUsingType_properties(NSPNGFileType, null)
    data.writeToFile_atomically(path, !0)
  },

  jsonFilePaths (path) {
    let filename
    const ds = this.fileManager.enumeratorAtPath(path)
    const paths = []
    // eslint-disable-next-line no-cond-assign
    while (filename = ds.nextObject()) {
      if (filename.pathExtension() == 'json') {
        paths.push(filename)
      }
    }

    return paths
  }
}
