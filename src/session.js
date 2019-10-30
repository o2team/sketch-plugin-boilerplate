export let context
export let document
export let version
export let sketchVersion
export let pluginFolderPath
export let resourcesPath
export let documentObjectID

function getPluginFolderPath (context) {
  // Get absolute folder path of plugin
  const split = context.scriptPath.split('/')
  split.splice(-3, 3)
  return split.join('/')
}

export default function (ctx) {
  context = ctx
  document = context.document || context.actionContext.document || MSDocument.currentDocument()
  documentObjectID = document.documentData().objectID() || NSUUID.UUID().UUIDString()
  // eslint-disable-next-line no-new-wrappers
  version = new String(context.plugin.version()).toString()
  // eslint-disable-next-line no-new-wrappers
  sketchVersion = new String(context.api().version).toString()
  pluginFolderPath = getPluginFolderPath(context)
  resourcesPath = `${pluginFolderPath}/Contents/Resources`
}
