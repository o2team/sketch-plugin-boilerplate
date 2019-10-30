import { SidePanelIdentifier } from './common/config'
import { getSettingForKey } from './utils'

export const onOpenDocument = context => {
  console.error('✅✅✅ action onOpenDocument')
}

export const onSelectionChanged = context => {
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

export const onCloseDocument = () => {
  COScript.currentCOScript().setShouldKeepAround(false)
}
