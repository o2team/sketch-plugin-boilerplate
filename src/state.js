import sketch from 'sketch'

export let context
export let document
export let version
export let sketchVersion
export let pluginFolderPath
export let resourcesPath
export let documentObjectID
export let IdentifierPrefix
export let SidePanelIdentifier
export let WINDOW_MOVE_INSTANCE
export let WINDOW_MOVE_SELECTOR
export let Menus

function updateIdentifier (objectID) {
  IdentifierPrefix = objectID ? `sketch-plugin-boilerplate-${objectID}` : 'sketch-plugin-boilerplate'
  SidePanelIdentifier = `${IdentifierPrefix}-side-panel`
  WINDOW_MOVE_INSTANCE = `window-move-instance-${objectID}`
  WINDOW_MOVE_SELECTOR = `window-move-selector-${objectID}`
  Menus = [
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'artboard',
      activeIcon: 'artboard-active',
      tooltip: '上传画板',
      identifier: `${IdentifierPrefix}-menu.artboard`,
      wkIdentifier: `${IdentifierPrefix}-webview.artboard`,
      type: 2,
      inGravityType: 1,
      url: 'https://aotu.io',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'icon',
      activeIcon: 'icon-active',
      tooltip: '图标',
      identifier: `${IdentifierPrefix}-menu.icon`,
      wkIdentifier: `${IdentifierPrefix}-webview.icon`,
      type: 2,
      inGravityType: 1,
      url: 'https://docs.pfan123.com/',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'component',
      activeIcon: 'component-active',
      tooltip: '组件',
      identifier: `${IdentifierPrefix}-menu.component`,
      wkIdentifier: `${IdentifierPrefix}-webview.component`,
      type: 2,
      inGravityType: 1,
      url: 'https://m.baidu.com/',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'palette',
      activeIcon: 'palette-active',
      tooltip: '调色板',
      identifier: `${IdentifierPrefix}-menu.palette`,
      wkIdentifier: `${IdentifierPrefix}-webview.palette`,
      type: 2,
      inGravityType: 1,
      url: 'https://aotu.io/',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'fill',
      activeIcon: 'fill-active',
      tooltip: '填充',
      identifier: `${IdentifierPrefix}-menu.fill`,
      wkIdentifier: `${IdentifierPrefix}-webview.fill`,
      type: 2,
      inGravityType: 1,
      url: 'https://aotu.io/',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'help',
      activeIcon: 'help-active',
      tooltip: '帮助中心',
      identifier: `${IdentifierPrefix}-menu.help`,
      wkIdentifier: `${IdentifierPrefix}-webview.help`,
      type: 2,
      inGravityType: 3,
      url: 'https://aotu.io/',
    },
    {
      rect: NSMakeRect(0, 0, 40, 40),
      size: NSMakeSize(24, 24),
      icon: 'setting',
      activeIcon: 'setting-active',
      tooltip: '设置',
      identifier: `${IdentifierPrefix}-menu.setting`,
      wkIdentifier: `${IdentifierPrefix}-webview.setting`,
      type: 2,
      inGravityType: 3,
      url: 'https://aotu.io/',
    }
  ]
}

function getPluginFolderPath (context) {
  // Get absolute folder path of plugin
  const split = context.scriptPath.split('/')
  split.splice(-3, 3)
  return split.join('/')
}

export default function (ctx) {
  context = ctx
  document = context.document || context.actionContext.document || MSDocument.currentDocument()
  documentObjectID = document.documentData().objectID()
  updateIdentifier(documentObjectID)
  // eslint-disable-next-line no-new-wrappers
  version = new String(context.plugin.version()).toString()
  // eslint-disable-next-line no-new-wrappers
  sketchVersion = new String(sketch.version.sketch).toString()
  pluginFolderPath = getPluginFolderPath(context)
  resourcesPath = `${pluginFolderPath}/Contents/Resources`
}
