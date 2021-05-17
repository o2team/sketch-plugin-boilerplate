import initState, { context, Menus, IdentifierPrefix, SidePanelIdentifier, SidePanelViewIdentifier } from './state'
import { Browser, BrowserManage } from './webview/index'
import { createImageView, addButton, createBoxSeparator, observerWindowResizeNotification, removeObserverWindowResizeNotification, getSettingForKey, setSettingForKey, removeSettingForKey } from './utils'

let toolbarView
/**
 * insertSidePanel 插入侧边栏
 * @param {*} toolbar
 * @param {*} identifier
 * @param {*} isInsert  默认插入，已插入删除
 */
const insertSidePanel = (toolbar, identifier) => {
  const splitViewController = context.document.splitViewController()

  if (getSettingForKey(identifier)) {
    removeSettingForKey(identifier)
    let startPoint = 0
    const views = splitViewController.splitViewItems()
    while (views[startPoint]) {
      if (views[startPoint].identifier === SidePanelViewIdentifier) {
        splitViewController.removeSplitViewItem(splitViewController.splitViewItems()[startPoint])
        break
      }
      startPoint++
    }

    return
  }

  // Make a view controller
  const viewController = NSViewController.alloc().init()
  viewController.view = toolbar
  viewController.view.frame = 40

  // Make a split view item
  toolbarView = NSSplitViewItem.splitViewItemWithViewController(
    viewController
  )

  toolbarView.identifier = SidePanelViewIdentifier

  // Insert the split view item at the appropriate index
  splitViewController.insertSplitViewItem_atIndex(toolbarView, 2)

  setSettingForKey(identifier, 'true')
}


export const onToggleSidePanel = context => {
  console.error('✅✅ 展示 plugins')
  // register context
  initState(context)

  const threadDictionary = NSThread.mainThread().threadDictionary()
  if (threadDictionary[SidePanelIdentifier]) {
    insertSidePanel(threadDictionary[SidePanelIdentifier], SidePanelIdentifier)
    onShutdown()
    return
  }

  // Long-running script
  COScript.currentCOScript().setShouldKeepAround(true)

  observerWindowResizeNotification(() => {
    const curWebView = BrowserManage.getCurrent()
    if (curWebView) {
      curWebView.updatePosition()
    }
  })

  const toolbar = NSStackView.alloc().initWithFrame(NSMakeRect(0, 0, 40, 400))
  threadDictionary[SidePanelIdentifier] = toolbar
  toolbar.identifier = SidePanelIdentifier
  toolbar.setSpacing(8)
  toolbar.setFlipped(true)
  toolbar.setBackgroundColor(NSColor.windowBackgroundColor())

  toolbar.orientation = 1


  toolbar.addView_inGravity(createImageView(NSMakeRect(0, 0, 40, 22), 'transparent', NSMakeSize(40, 22)), 1)
  const Logo = createImageView(NSMakeRect(0, 0, 40, 30), 'logo', NSMakeSize(40, 28))
  toolbar.addSubview(Logo)

  Menus.map((item, index) => {
    const {
      rect = NSMakeRect(0, 0, 40, 40),
      size = NSMakeSize(24, 24),
      icon,
      activeIcon,
      tooltip,
      identifier,
      wkIdentifier,
      type = 2,
      inGravityType = 1,
      url,
    } = item

    const Button = addButton({
      rect,
      size,
      icon,
      activeIcon,
      tooltip,
      identifier,
      type,
      callAction: sender => {
        // log('sender', sender)
        const threadDictionary = NSThread.mainThread().threadDictionary()
        const menuBtnRegExp = new RegExp(`${IdentifierPrefix}-menu*`)
        for (const k in threadDictionary) {
          if (menuBtnRegExp.test(k) && k !== identifier) {
            threadDictionary[k].setState(NSOffState)
          }
        }

        const options = {
          sender,
          identifier: wkIdentifier,
          frame: false,
          show: false,
          width: 320,
          height: 480,
          inGravityType,
          url,
        }

        const { browserWindow } = new Browser(options)

        const webView = browserWindow.webContents

        webView.on('did-start-loading', () => {
          // console.error('did-start-loading')
        })

        webView.on('did-finish-load', () => {
          // console.error('did-finish-load')
        })

        webView.on('openView', options => {
          // console.error('openViewopenView')
        })
      }
    })

    threadDictionary[identifier] = Button

    toolbar.addView_inGravity(createBoxSeparator(), inGravityType)
    toolbar.addView_inGravity(Button, inGravityType)

    if (icon === 'fill') toolbar.addView_inGravity(createBoxSeparator(), inGravityType)
    if (index === Menus.length - 1) toolbar.addView_inGravity(createImageView(NSMakeRect(0, 0, 40, 8), 'transparent'), 3)
  })
  insertSidePanel(toolbar, SidePanelIdentifier)
}


export const onOpenDocument = () => {}

export const onCloseDocument = context => {
  initState(context)
  onShutdown()
}

// handler cleanly Long-running script
export function onShutdown () {
  // console.error('✅✅ my-plugins onShutdown')
  const threadDictionary = NSThread.mainThread().threadDictionary()
  BrowserManage.empty()
  const prefixRegExp = new RegExp(`${IdentifierPrefix}*`)
  const webViewPrefixRegExp = new RegExp(`${IdentifierPrefix}-webview*`)

  // clear MSClass
  for (const key in threadDictionary) {
    if (prefixRegExp.test(key)) {
      if (webViewPrefixRegExp.test(key)) {
        threadDictionary[key].close()
      }
      threadDictionary.removeObjectForKey(key)
    }
  }

  // clear WindowResizeNotification
  removeObserverWindowResizeNotification()

  COScript.currentCOScript().setShouldKeepAround(false)
}
