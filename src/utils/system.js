import MochaJSDelegate from 'mocha-js-delegate'
import { context, WINDOW_MOVE_INSTANCE, WINDOW_MOVE_SELECTOR } from '../state'


/**
 * openUrlInBrowser 浏览器打开链接
 * @param {string} url
 */
export const penUrlInBrowser = url => {
  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
}

/**
 * getNewUUID 获取唯一 ID
 */
export const getNewUUID = () => NSUUID.UUID().UUIDString()

/**
 * getThreadDictForKey 获取挂载 mainThread 的键值
 * @param {string} key
 */
export const getThreadDictForKey = key => NSThread.mainThread().threadDictionary()[key]

/**
 * setThreadDictForKey 挂载到 mainThread 的键值
 * @param {string} key
 * @param {string} value
 */
export const setThreadDictForKey = (key, value) => NSThread.mainThread().threadDictionary()[key] = value

/**
 * removeThreadDictForKey 移除挂载到 mainThread 的键值
 * @param { string } key
 */
export const removeThreadDictForKey = key => {
  if (NSThread.mainThread().threadDictionary()[key]) NSThread.mainThread().threadDictionary().removeObjectForKey(key)
}

/**
 * getSettingForKey 获取挂载 NSUserDefaults 的键值
 * @param { string } key
 */
export const getSettingForKey = key => NSUserDefaults.standardUserDefaults().objectForKey(key)

/**
 * setSettingForKey 挂载到 NSUserDefaults 的键值
 * @param {string} key
 * @param {string} value
 */
export const setSettingForKey = (key, value) => NSUserDefaults.standardUserDefaults().setObject_forKey(value, key)

/**
 * removeSettingForKey 移除挂载到 NSUserDefaults 的键值
 * @param { string } key
 */
export const removeSettingForKey = key => {
  setSettingForKey(key, nil)
}

/**
 * showPluginsPane 显示 plugin window
 */
export const showPluginsPane = () => {
  const identifier = MSPluginsPreferencePane.identifier()
  const preferencesController = MSPreferencesController.sharedController()
  preferencesController.switchToPaneWithIdentifier(identifier)
  preferencesController.currentPreferencePane().tableView().reloadData()
}

/**
 * showLibrariesPane 显示 libraries window
 */
export const showLibrariesPane = () => {
  const identifier = MSAssetLibrariesPreferencePane.identifier()
  const preferencesController = MSPreferencesController.sharedController()
  preferencesController.switchToPaneWithIdentifier(identifier)
  preferencesController.currentPreferencePane().tableView().reloadData()
}

/**
 * getSystemVersion 获取系统版本
 */
export const getSystemVersion = () => {
  try {
    const systemVersion = NSProcessInfo.processInfo().operatingSystemVersionString().match(/\d*\.\d*(\.\d*)?/)
    if (systemVersion && systemVersion[0]) {
      const versions = systemVersion[0]
      return versions.split('.').length === 2 ? ''.concat(versions, '.0') : versions
    }
    return '0.0.0'
  } catch (e) {
    return '0.0.0'
  }
}

/**
 * getPluginVersion 获取插件版本
 */
export const getPluginVersion = () => context.plugin.version()

/**
 * reloadPlugins 重载插件
 */
export const reloadPlugins = () => {
  AppController.sharedInstance().pluginManager().reloadPlugins()
}

/**
 * getFileContentFromModal 打开文件选择器，获取文件的文本内容
 * @param {Array<string>} fileTypes 文件类型
 */
export const getFileContentFromModal = (fileTypes = []) => {
  const openPanel = NSOpenPanel.openPanel()

  openPanel.setTitle('Choose a JSON File')
  openPanel.canCreateDirectories = false
  openPanel.canChooseFiles = true
  openPanel.allowedFileTypes = fileTypes

  const openPanelButtonPressed = openPanel.runModal()
  if (openPanelButtonPressed === NSModalResponseOK) {
    const filePath = openPanel.URL().path()
    return NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, nil)
  }

  return ''
}

/**
 * getSavePathFromModal 获取文件的存储路径
 * @param {String} fileName 文件名
 * @param {Array<string>} fileTypes 文件类型
 */
export const getSavePathFromModal = (fileName, fileTypes = ['json']) => {
  if (!fileName) return
  const savePanel = NSSavePanel.savePanel()
  savePanel.canCreateDirectories = true
  savePanel.nameFieldStringValue = fileName
  savePanel.allowedFileTypes = fileTypes

  const savePanelActionStatus = savePanel.runModal()
  if (savePanelActionStatus === NSModalResponseOK) {
    const filePath = savePanel.URL().path()
    return {
      filePath,
      fileName: savePanel.nameFieldStringValue(),
    }
  }

  return false
}

/**
 * observerWindowResizeNotification 监听窗口resize
 * @param {*} fn
 */
export const observerWindowResizeNotification = fn => {
  // Keep script around, otherwise everything will be dumped once its run
  // COScript.currentCOScript().setShouldKeepAround(true)

  if (!getThreadDictForKey(WINDOW_MOVE_INSTANCE)) {
    // Create a selector
    const Selector = NSSelectorFromString('onWindowMove:')

    const delegate = new MochaJSDelegate({
      'onWindowMove:': notification => {
        // const bounds = NSScreen.mainScreen().frame()
        fn(notification)
        // log(notification)
        // NSNotificationCenter.defaultCenter().removeObserver_name_object(delegateInstance, NSWindowDidResizeNotification, nil)
      }
    })

    // Don't forget to create a class instance of the delegate
    const delegateInstance = delegate.getClassInstance()

    NSNotificationCenter
      .defaultCenter()
      .addObserver_selector_name_object(delegateInstance, Selector, NSWindowDidResizeNotification, nil)

    setThreadDictForKey(WINDOW_MOVE_INSTANCE, delegateInstance)
    setThreadDictForKey(WINDOW_MOVE_SELECTOR, Selector)
  }
}

/**
 * removeObserverWindowResizeNotification 清除监听窗口resize
 * @param {*} fn
 */
export const removeObserverWindowResizeNotification = () => {
  const delegateInstance = getThreadDictForKey(WINDOW_MOVE_INSTANCE)
  if (delegateInstance) {
    NSNotificationCenter.defaultCenter().removeObserver_name_object(delegateInstance, NSWindowDidResizeNotification, nil)
    removeThreadDictForKey(WINDOW_MOVE_INSTANCE)
    removeThreadDictForKey(WINDOW_MOVE_SELECTOR)
  }
}
