import { getSettingForKey } from './utils'

const autoSidePanelCommand = context => {
  const objectID = (context.document || context.actionContext.document || MSDocument.currentDocument()).documentData().objectID()
  const IdentifierPrefix = objectID ? `sketch-plugin-boilerplate-${objectID}` : 'sketch-plugin-boilerplate'
  const SidePanelIdentifier = `${IdentifierPrefix}-side-panel`
  const isShow = getSettingForKey(SidePanelIdentifier)

  if (isShow) {
    const toggleSidePanelCommand = context.command.pluginBundle().commands()['sketch-plugin-boilerplate.toggle-side-panel']
    context.command = toggleSidePanelCommand
    AppController.sharedInstance().runPluginCommand_fromMenu_context(
      toggleSidePanelCommand,
      false,
      context
    )
  }
}

export const onOpenDocument = context => {
  setTimeout(autoSidePanelCommand.bind(null, context), 100)
}

export const onSelectionChanged = () => {

}

export const onCloseDocument = () => {
  COScript.currentCOScript().setShouldKeepAround(false)
}
