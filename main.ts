import {
  MarkdownView,
  CachedMetadata,
  Notice,
  Plugin,
  TFile,
} from "obsidian";

interface DailyEntrySettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: DailyEntrySettings = {
  mySetting: 'default'
}

export default class DailyEntryPlugin extends Plugin {
  settings: DailyEntrySettings;

  async onload() {

    const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => this.createAndPush());
  }

  onunload() {}


  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // the first function that runs
  async createAndPush() {
    // const app = window.app as App;
    const todaysDate = new Date().toDateString()
    const currentTime = new Date().toLocaleTimeString();

    let newContent = currentTime + '\n'
    let inlineSetting = ""
    let newTitle = todaysDate 
    let shouldPrepend = false;

    // check if syntax to push file is present
    try {
      // check if file exists already

      var fileWithName: TFile | undefined;
      var baseTitleName = newTitle;
      if (baseTitleName.includes("/")) {
        var pathParts = baseTitleName.split("/");
        baseTitleName = pathParts[pathParts.length - 1];
      }
      const files = this.app.vault.getMarkdownFiles().filter(item => {
        return item.basename == baseTitleName

      });

      fileWithName = undefined;
      // append content or create new file
      if(files.length === 0){
        new Notice(`Creating file and appending timestamp...`);
        const newFile = await this.app.vault.create(newTitle + ".md", newContent);

      } else {
        fileWithName = files[0];
        new Notice(`File already exists. Appending content...`);
        const fullExistingFileText = await this.app.vault.read(fileWithName);
        var existingFileText = ""
        await this.app.vault.modify(fileWithName, fullExistingFileText + "\n\n" + newContent)


      }
    await this.app.workspace.openLinkText(newTitle, "", false);
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editor = view.editor;
        editor.setCursor(editor.lastLine())
        editor.focus()

      } catch (err) {
        new Notice(`Unhandled error. Doing nothing`)
      }
    }
  
}