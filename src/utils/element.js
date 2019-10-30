import { context } from '../state'

/**
 * getImageURL 获取 icon 路径
 * @param {*} name
 */
export const getImageURL = name => {
  const isRetinaDisplay = NSScreen.mainScreen().backingScaleFactor() > 1
  const suffix = isRetinaDisplay ? '@2x' : ''
  const pluginSketch = context.plugin.url()
  const imageURL = pluginSketch
    .URLByAppendingPathComponent('Contents')
    .URLByAppendingPathComponent('Resources')
    .URLByAppendingPathComponent('icons')
    .URLByAppendingPathComponent(`${name + suffix}.png`)
  return imageURL
}

/**
 * createImage 创建 NSImage
 * @param {*} imageURL
 * @param {*} size
 */
export const createImage = (imageURL, size) => {
  // NSImage.alloc().initWithSize([width, height])
  const Image = NSImage.alloc().initWithContentsOfURL(imageURL)
  size && Image.setSize(size)
  Image.setScalesWhenResized(true)
  return Image
}

/**
 * createImageView 创建 NSImageView
 * @param {*} rect
 * @param {*} icon
 * @param {*} size
 */
export const createImageView = (rect, icon, size) => {
  const imageView = NSImageView.alloc().initWithFrame(rect)
  const imageURL = getImageURL(icon)
  const image = createImage(imageURL, size)
  imageView.setImage(image)
  imageView.setAutoresizingMask(5)
  return imageView
}

/**
 * createImageView 创建 NSBoxSeparator
 */
export const createBoxSeparator = () => {
  // set to 0 in width and height
  const separtorBox = NSBox.alloc().initWithFrame(NSZeroRect)
  // Specifies that the box is a separator
  separtorBox.setBoxType(2 || NSBoxSeparator)
  separtorBox.setBorderColor(NSColor.colorWithHex('#F5F5F5'))
  try {
    separtorBox.setBorderColor(NSColor.colorWithSRGBRed_green_blue_alpha(1.0, 1.0, 1.0, 1.0))
  } catch (error) {
    console.error(error)
  }

  // separtorBox.setTransparent(true)
  return separtorBox
}

/**
 * addButton 创建 NSButton
 * @param {*} param { rect, size, icon, activeIcon, tooltip = '', type = 5, callAction }
 */
export const addButton = ({ rect, size, icon, activeIcon, tooltip = '', type = 5, callAction }) => {
  const button = rect ? NSButton.alloc().initWithFrame(rect) : NSButton.alloc().init()
  const imageURL = getImageURL(icon)
  const image = createImage(imageURL, size)
  button.setImage(image)

  if (activeIcon) {
    const activeImageURL = getImageURL(activeIcon)
    const activeImage = createImage(activeImageURL, size)
    button.setAlternateImage(activeImage)
  } else {
    button.setAlternateImage(image)
  }
  button.setBordered(false)
  button.sizeToFit()
  button.setToolTip(tooltip)
  button.setButtonType(type || NSMomentaryChangeButton)
  button.setCOSJSTargetFunction(callAction)
  button.setAction('callAction:')
  button.removeBadge = () => {
    button.setImage(image)
    button.hasBadge = false
  }
  button.icon = icon
  return button
}

/**
 * 创建 bounds
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 */
export const createBounds = (x = 0, y = 0, width = 0, height = 0) => NSMakeRect(
  x,
  y,
  width,
  height
)

/**
 * createView 创建 NSPanel
 * @param {*} frame  options
 */
export const createPanel = (options = {
  width: 800,
  height: 600,
  minWidth: 0,
  minHeight: 0,
  x: 0,
  y: 0,
  title: 'panel',
  identifier: 'sketch-panel',
  vibrancy: true,
}) => {
  COScript.currentCOScript().setShouldKeepAround(true)

  const threadDictionary = NSThread.mainThread().threadDictionary()
  const mainScreenRect = NSScreen.screens()
    .firstObject()
    .frame()

  const Bounds = NSMakeRect(
    options.x ? options.x : Math.round((NSWidth(mainScreenRect) - options.width) / 2),
    options.y ? NSHeight(mainScreenRect) - options.y : Math.round((NSHeight(mainScreenRect) - options.height) / 2),
    options.width,
    options.height
  )
  const panel = NSPanel.alloc().init()
  panel.setFrame_display(Bounds, true)
  panel.setOpaque(0)
  threadDictionary[options.identifier] = panel

  // NSWindowStyleMaskDocModalWindow 直角
  panel.setStyleMask(NSWindowStyleMaskFullSizeContentView | NSBorderlessWindowMask | NSResizableWindowMask | NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask | NSWindowStyleMaskResizable)
  panel.setBackgroundColor(NSColor.whiteColor() || NSColor.windowBackgroundColor())

  panel.title = options.title
  panel.movableByWindowBackground = true
  panel.titlebarAppearsTransparent = true
  panel.titleVisibility = NSWindowTitleHidden

  panel.center()
  panel.makeKeyAndOrderFront(null)
  panel.setLevel(NSFloatingWindowLevel)
  panel.minSize = NSMakeSize(options.minWidth, options.minHeight)

  panel.standardWindowButton(NSWindowZoomButton).setHidden(true)
  panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true)
  panel.standardWindowButton(NSWindowCloseButton).setHidden(true)

  // Some third-party macOS utilities check the zoom button's enabled state to
  // determine whether to show custom UI on hover, so we disable it here to
  // prevent them from doing so in a frameless app window.
  panel.standardWindowButton(NSWindowZoomButton).setEnabled(false)

  // The fullscreen button should always be hidden for frameless window.
  if (panel.standardWindowButton(NSWindowFullScreenButton)) {
    panel.standardWindowButton(NSWindowFullScreenButton).setHidden(true)
  }

  panel.showsToolbarButton = false
  panel.movableByWindowBackground = true

  if (options.vibrancy) {
    // Create the blurred background
    const effectView = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, options.width, options.height))
    effectView.setMaterial(NSVisualEffectMaterialPopover)
    effectView.setAutoresizingMask(NSViewWidthSizable | NSViewHeightSizable)
    effectView.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight))
    effectView.setBlendingMode(NSVisualEffectBlendingModeBehindWindow)

    // Add it to the panel
    panel.contentView().addSubview(effectView)
  }

  const closeButton = panel.standardWindowButton(NSWindowCloseButton)
  closeButton.setCOSJSTargetFunction(sender => {
    log(sender)

    panel.close()

    // Remove the reference to the panel
    threadDictionary.removeObjectForKey(options.identifier)

    // Stop this Long-running script
    COScript.currentCOScript().setShouldKeepAround(false)
  })
  return panel
}

/**
 * createView 创建 NSView
 * @param {*} frame  NSMakeRect(0, 0, 40, 40)
 */
export const createView = frame => {
  const view = NSView.alloc().initWithFrame(frame)
  view.setFlipped(1)
  return view
}

/**
 * createBox 创建 NSBox
 * @param {*} frame  NSMakeRect(0, 0, 40, 40)
 */
export const createBox = frame => {
  const box = NSBox.alloc().initWithFrame(frame)
  box.setTitle('')
  return box
}


/**
 * createBox 创建 createTextField
 * @param {*} string
 * @param {*} frame NSMakeRect(0, 0, 40, 40)
 */
export const createTextField = (string, frame) => {
  const field = NSTextField.alloc().initWithFrame(frame)

  field.setStringValue(string)
  field.setFont(NSFont.systemFontOfSize(12))
  field.setTextColor(
    NSColor.colorWithCalibratedRed_green_blue_alpha(0, 0, 0, 0.7)
  )
  field.setBezeled(0)
  field.setBackgroundColor(NSColor.windowBackgroundColor())
  field.setEditable(0)

  return field
}

