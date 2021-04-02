import HelperTrigger from '../helper/HelperTrigger.js'
import HelperLocalStore from '../helper/HelperLocalStore.js'
import HelperDOM from '../helper/HelperDOM.js'
import TopCommandSave from '../main/top/command/TopCommandSave.js'
import DialogComponent from '../component/DialogComponent.js'
import HelperProject from '../helper/HelperProject.js'
import Project from '../start/Project.js'
import Auth from '../start/Auth.js'
import TopZoom from '../main/top/TopZoom.js'

export default {
  loadStart () {
    this.loadPage('start')
    HelperLocalStore.clearStore()
    Auth.injectAuthData()
  },

  loadPage (page) {
    DialogComponent.closeAllDialogs()
    this.addPageContainer(page)
  },

  addPageContainer (page) {
    const container = document.getElementById('page')
    const template = HelperDOM.getTemplate(`template-page-${page}`)
    HelperDOM.replaceOnlyChild(container, template)
  },

  async loadMain (file = null) {
    // save first before loading a new file
    if (file) await TopCommandSave.save()
    this.loadPage('main')
    HelperTrigger.triggerReload('responsive-mode-list')
    await Project.injectDesignSystemCss()
    HelperLocalStore.removeAllTemporary()
    this.loadFilePanel(file)
    TopZoom.setSavedZoomLevel()
  },

  loadFilePanel (file) {
    HelperTrigger.triggerOpenPanel('panel-button-file', {
      force: true,
      loadFile: file || HelperProject.getFolder() + '/index.html'
    })
  },

  setIntervals () {
    TopCommandSave.setAutoSaveInterval()
  }
}
