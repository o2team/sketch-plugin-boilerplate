import { context, document } from '../session'
import BrowserWindow from 'sketch-module-web-view'

export const BrowserManage =  {
  list: [],

  add (browser) {
    this.list.push(browser)
  },

	get (identifier) {
		return this.list.find(d => d.identifier === identifier)
  },

  getCurrent(){
		return this.list.find(d => d.browserWindow.isVisible())
  },

  empty(){
    this.list = []
  }
}

const getAbsScreenOfTop = () => {
  const contentView = document.documentWindow().contentView()
  const width = contentView.frame().size.width
  const height = contentView.frame().size.height
  const x = contentView.frame().origin.x
  const y = contentView.frame().origin.y
  const rect = document.window().convertRectToScreen(NSMakeRect(x, y, width, height))
  return rect
}

const getAbsWindowOfView = (button) =>  {
  const bounds = button.bounds()
  const width = bounds.size.width
  const height = bounds.size.height
  const x = bounds.origin.x
  const y = bounds.origin.y
  return button.convertRect_toView(NSMakeRect(x, y, width, height), nil)
}

export class Browser {
  constructor(options) {
    this.options = Object.assign({
      width: 290,
      height: 550,
      minimizable: false,
      resizable: false,
      transparent: false,
      closable: false,
      center: false,
      alwaysOnTop: true,
      titleBarStyle: 'hiddenInset',
      frame: false,
      show: false
    }, options)

    this.identifier = options.identifier

    BrowserManage.list.forEach(d => {
      if ( d.identifier != this.identifier ) {
          if ( d.browserWindow.isVisible() ) {
              d.hide()
          }
      }
    })

    const existBrowser = BrowserManage.get(options.identifier)
    if(existBrowser){
      if ( existBrowser.browserWindow.isVisible() ) {
        existBrowser.hide()
      } else {
        existBrowser.show()
      }
      return existBrowser
    }

    this.browserWindow = new BrowserWindow(options)
    options.url && this.browserWindow.loadURL(options.url)
    this.browserWindow._panel.setStyleMask(NSWindowStyleMaskDocModalWindow)
    BrowserManage.add(this)
    this.show()
  }

  show () {
    this.updatePosition()
    const documentWindow = context.document.documentWindow()
    documentWindow.addChildWindow_ordered(this.browserWindow._panel, true)

    this.browserWindow.show()
  }

  hide () {
    this.browserWindow.hide()
    if (this.browserWindow.webContents) {
      this.browserWindow.webContents.removeAllListeners()
    }
  }

  updatePosition () {
    const { sender, inGravityType } = this.options
    const [ width, height ] = this.browserWindow.getSize()
    const winRect = getAbsScreenOfTop()
    const senderRect = getAbsWindowOfView(sender)
    const x = winRect.origin.x + senderRect.origin.x - sender.frame().origin.x - width - 1

    if( inGravityType === 1){
      const y = winRect.origin.y + senderRect.origin.y + 24 - height + 8
      this.browserWindow._panel.setFrame_display(NSMakeRect(x, y, width, height), true)
    } else if (inGravityType === 3) {
      const y = winRect.origin.y
      this.browserWindow._panel.setFrame_display(NSMakeRect(x, y, width, height), true)
    }

  }
}
