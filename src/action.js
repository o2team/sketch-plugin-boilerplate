import { context } from './session'
import { SidePanelIdentifier } from './common/config'
import { getSettingForKey } from './utils'

export const onOpenDocument = context => {
  console.error('✅✅✅ action onOpenDocument')
  const isShow = getSettingForKey(SidePanelIdentifier)
  console.error('✅✅✅ action isShow', isShow)
  if (isShow) {
    setTimeout(() => {
      const toggleSidePanelCommand = context.command.pluginBundle().commands()['sketch-plugin-boilerplate.my-command-identifier']
      context.command = toggleSidePanelCommand
      AppController.sharedInstance().runPluginCommand_fromMenu_context(
        toggleSidePanelCommand,
        false,
        context
      )
    }, 100)
  }
}

export const onCloseDocument = () => {
  console.error('✅✅✅action', 'onCloseDocument')
  COScript.currentCOScript().setShouldKeepAround(false)
}
