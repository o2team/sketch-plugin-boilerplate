import { context } from '../session'
import sketch from 'sketch'


/**
 * getSketchSelected 获取当前选择的 document， page， selection
 */
export const getSketchSelected = () => {
  const Document = sketch.Document
  const document = Document.getSelectedDocument() // 当前被选择的 document
  const page = document.selectedPage // 当前被选择的 page
  const artboard = sketch.Artboard.fromNative(page._object.currentArtboard())
  const selection = document.selectedLayers // 当前选择图层

  return {
    document,
    page,
    artboard,
    selection,
  }
}


/**
 * getSelected 获取当前 document、page、artboard、selection
 */
export const getSelected = () => {
  const document = context.document // 获取 sketch 当前 document
  const plugin = context.plugin
  const command = context.command
  const page = document.currentPage() // 当前被选择的 page
  const artboards = page.artboards() // 所有的画板
  const selectedArtboard = page.currentArtboard() // 当前被选择的画板
  const selection = context.selection // 当前选择图层

  return {
    document,
    plugin,
    command,
    page,
    artboards,
    selectedArtboard,
    selection,
  }
}


/**
 * 获取当前脚本执行路径
 * @param {*} context
 */
export const getScriptExecPath = context => context.scriptPath

/**
 * getDocumentPath 获取所选择 document 路径
 */
export const getDocumentPath = () => {
  const Document = context.document
  return Document.fileURL() ? Document.fileURL().path() : nil
}

/**
 * getDocumentName 获取所选择 document name
 */
export const getDocumentName = () => (getDocumentPath(context) ? getDocumentPath(context).lastPathComponent() : nil)


/**
 * dumpLayer 导出json数据
 * @param {*} sketchObject  如 context.document.currentPage()
 */
export const dumpLayer = sketchObject => {
  // return NSDictionary
  const jsonData = sketchObject.treeAsDictionary()
  const nsData = NSJSONSerialization.dataWithJSONObject_options_error_(jsonData, 0, nil)
  return NSString.alloc().initWithData_encoding_(nsData, 4)
}

/**
 * dumpSymbol 导出json数据
 * @param {*} symbolInstance // context.selection[0]
 */
export const dumpSymbol = symbolInstance => {
  // return symbolInstance
  const immutableInstance = symbolInstance.immutableModelObject()
  return MSJSONDataArchiver.archiveStringWithRootObject_error(immutableInstance, nil)
}
