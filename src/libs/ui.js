/*
  global
  NSAnimationContext
  NSApplication
  NSDate
  NSFont
  NSLayoutConstraint
  NSMakeRange
  NSRunLoop
  NSScrollView
  NSTextView
  coscript
*/

const util = require('./util');
const $ = require('./collection-helpers');

/* Constructor
   ----------- */
function UI(nib) {
  this.nib = nib;
}

/* Instance methods
   ---------------- */

UI.prototype.showProgressSheet = function(label, maxValue) {
  this.nib.progressIndicator.setDoubleValue(0);

  if (label) {
    this.nib.progressLabel.setStringValue(label);
  }

  if (maxValue) {
    this.nib.progressIndicator.setMaxValue(maxValue);
  }

  if (!this.nib.progressSheet.isEqualTo(this.nib.mainWindow.attachedSheet())) {
    // Only show sheet if not already attached.
    this.nib.mainWindow.beginSheet_completionHandler(this.nib.progressSheet, null);
  }
};

UI.prototype.hideProgressSheet = function() {
  this.nib.mainWindow.endSheet(this.nib.progressSheet);
};

UI.prototype.incrementProgress = function(incrementBy) {
  this.nib.progressIndicator.incrementBy(incrementBy || 1);

  // Work around to display progress bar updates even when
  // code is running in a loop on the main thread.
  NSRunLoop.mainRunLoop().runUntilDate(NSDate.dateWithTimeIntervalSinceNow(0.01));
};

UI.prototype.showDocumentMessage = function(document, options) {
  const view = this.nib.documentMessageView;
  const label = this.nib.documentMessageLabel;
  const actionLabel = this.nib.documentMessageActionLabel;
  const button = this.nib.documentMessageButton;
  const imageView = this.nib.documentMessageImageView;

  // Place the message in the main content view of the document’s window.
  const parentView = document.window().contentView();

  // Set the icon color. Ideally this would all be set in Xcode, but I couldn’t
  // find a way to set the icon color from there, so I’m taking it from the
  // action text since they are supposed to be the same anyway.
  const iconColor = actionLabel.textColor();
  const tintedIconImage = util.applyTintToTemplateImage(imageView.image(), iconColor);
  imageView.setImage(tintedIconImage);

  // Set the message text.
  label.setStringValue(options.message || '');

  // Set the action text.
  // Note: this kind of messaage is only being used in one place right now and
  // the design calls for it to be dismissed if you click anywhere on the
  // message. This is implemented with a transparent button covering the entire
  // message area. In the future it might make sense to make dismissing the
  // message this way optional or to make the action separately clickable. For
  // now this would introduce added complexity for the sake of theoretical uses
  // of this message feature. Anyway, that is why the action label is given by
  // options.action.message -- so that there can be an options.action.handler
  // (or whatever) in the future.
  actionLabel.setStringValue((options.action || {}).message || '');

  // Add the message.
  parentView.addSubview(view);

  // Click button to dismiss.
  this.nib.attachTargetAndAction(button, function() {
    // Fade out animation.
    NSAnimationContext.beginGrouping();
    NSAnimationContext.currentContext().setDuration(0.3);
    view.animator().setAlphaValue(0);
    NSAnimationContext.endGrouping();

    coscript.scheduleWithInterval_jsFunction(0.4, function() {
      view.removeFromSuperview();
    });
  });

  // Add constraints.
  view.setTranslatesAutoresizingMaskIntoConstraints(false);
  const viewsDictionary = {
    view: view
  };
  parentView.addConstraints(
    NSLayoutConstraint.constraintsWithVisualFormat_options_metrics_views(
      'V:[view]-0-|',
      0,
      null,
      viewsDictionary
    )
  );
  parentView.addConstraints(
    NSLayoutConstraint.constraintsWithVisualFormat_options_metrics_views(
      'H:|-0-[view]-0-|',
      0,
      null,
      viewsDictionary
    )
  );

  // Fade in animation for when the message appears.
  view.setAlphaValue(0);
  NSAnimationContext.beginGrouping();
  NSAnimationContext.currentContext().setDuration(0.3);
  view.animator().setAlphaValue(1);
  NSAnimationContext.endGrouping();
};

/* Static functions
   ---------------- */

UI.isMainPluginWindow = function(window) {
  return window && window.identifier() == 'com.invision.dsm.mainWindow';
};

UI.getMainPluginWindow = function() {
  const allWindows = NSApplication.sharedApplication().windows();
  return $.find(allWindows, UI.isMainPluginWindow);
};

UI.createScrollingTextView = function(contentString, frame, fontSize) {
  fontSize = fontSize || NSFont.systemFontSize();

  const scrollView = NSScrollView.alloc().initWithFrame(frame);
  scrollView.setHasVerticalScroller(true);

  const textView = NSTextView.alloc().initWithFrame(frame);
  textView.setVerticallyResizable(true);
  textView.setEditable(false);
  const attributedString = textView.textStorage();
  attributedString.replaceCharactersInRange_withString(
    NSMakeRange(0, 0),
    contentString
  );
  attributedString.setAttributes_range(
    { NSFont: NSFont.systemFontOfSize(fontSize) },
    NSMakeRange(0, attributedString.characters().count())
  );

  scrollView.setDocumentView(textView);
  return scrollView;
};

module.exports = UI;
