import fs from 'fs'
import File from '../file/File.js'

export default {
  getCompiledCss (folder) {
    const general = this.getCssContent(this.getGeneralCssFiles(folder))
    const designSystem = this.getDesignSystemCss(folder)
    const page = this.getCssContent(this.getPageCssFiles(folder))
    const animation = this.getAnimationCss(folder, general + page)
    return general + '\n' + animation + '\n' + designSystem + '\n' + page
  },

  getGeneralCssFiles (folder) {
    const paths = []
    // order matters
    const files = ['reset', 'font', 'root', 'component-css', 'component-html']
    for (const file of files) {
      const filePath = folder + '/css/general/' + file + '.css'
      if (fs.existsSync(filePath)) paths.push(filePath)
    }
    return paths
  },

  getPageCssFiles (folder) {
    const paths = []
    const files = File.readFolder(folder + '/css/page')
    for (const file of files) {
      if (file.extension === 'css') paths.push(file.path)
    }
    return paths
  },

  getCssContent (files) {
    let css = ''
    for (const file of files) {
      css += css ? '\n' : ''
      css += fs.readFileSync(file).toString()
    }
    return css
  },

  getDesignSystemCss (folder) {
    const file = folder + '/css/general/design-system.css'
    return fs.existsSync(file) ? fs.readFileSync(file).toString() : ''
  },

  getAnimationCss (folder, css) {
    let selectedCss = ''
    const animations = this.getAnimationsUsed(css)
    if (!animations.length) return ''
    const file = folder + '/css/general/animation.css'
    const animationCss = fs.readFileSync(file).toString() + '@'
    for (const animation of animations) {
      const regex = new RegExp(`(@keyframes ${animation} [\\s\\S]*?}[\\s]*)@`, 'g')
      selectedCss += regex.exec(animationCss)[1]
    }
    return selectedCss
  },

  getAnimationsUsed (css) {
    const list = []
    const regex = css.matchAll(/animation:(.*?);/g)
    for (const match of regex) {
      list.push(match[1].substring(match[1].lastIndexOf(' ') + 1))
    }
    return list
  },

  getHtmlFiles (folder) {
    const files = File.readFolder(folder)
    const list = []
    this.addHtmlFolderFiles(files, folder, list)
    return list
  },

  addHtmlFolderFiles (files, folder, list) {
    for (const file of files) {
      if (file.type === 'folder' && !this.checkAllowedHtmlFolder(file.name)) continue
      if (file.type === 'folder') this.addHtmlFolderFiles(file.children, folder, list)
      if (file.extension !== 'html') continue
      if (file.path.startsWith(folder + '/component')) {
        file.isComponent = true
      }
      list.push(file)
    }
  },

  checkAllowedHtmlFolder (name) {
    const ignore = ['asset', 'css', 'font', 'js', '_desech', '_export']
    for (const val of ignore) {
      if (name === val) return false
    }
    return true
  },

  getRootMiscFiles (folder, htmlFiles) {
    const list = []
    const files = File.readFolder(folder)
    for (const file of files) {
      // we don't look inside children, only at the top root folder
      if (this.isRootMiscFolder(file, htmlFiles) ||
        (file.type === 'file' && file.extension !== 'html')) {
        list.push(file)
      }
    }
    return list
  },

  isRootMiscFolder (file, htmlFiles) {
    if (file.type !== 'folder') return false
    return ['asset', 'font'].includes(file.name) ||
      (!['css', 'js', '_desech', '_export'].includes(file.name) &&
      !this.isHtmlRootFolder(file.path, htmlFiles))
  },

  isHtmlRootFolder (filePath, htmlFiles) {
    for (const htmlFile of htmlFiles) {
      if (htmlFile.path.startsWith(filePath)) return true
    }
    return false
  }
}
