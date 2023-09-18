import { MarkdownView, CachedMetadata, Notice, Plugin, TFile } from "obsidian";

export default class DailyEntryPlugin extends Plugin {
  async onload() {
    const ribbonIconEl = this.addRibbonIcon('dice', 'Daily Entry', (evt: MouseEvent) => this.createAndAppend());
  }

  onunload() {}

  async createAndAppend() {
    const todaysDate = new Date().toDateString();
    const currentTime = new Date().toLocaleTimeString();
    let newContent = currentTime + '\n';
    let newTitle = todaysDate;
    
    try {
      // Check if file exists already
      let baseTitleName = newTitle;
      if (baseTitleName.includes("/")) {
        const pathParts = baseTitleName.split("/");
        baseTitleName = pathParts[pathParts.length - 1];
      }
      
      const files = this.app.vault.getMarkdownFiles().filter(item => {
        return item.basename == baseTitleName;
      });

      // Append content or create a new file
      if (files.length === 0) {
        new Notice(`Creating file and appending timestamp...`);
        const newFile = await this.app.vault.create(newTitle + ".md", newContent);
      } else {
        const fileWithName = files[0];
        new Notice(`File already exists. Appending content...`);
        const fullExistingFileText = await this.app.vault.read(fileWithName);
        await this.app.vault.modify(fileWithName, fullExistingFileText + "\n\n" + newContent);
      }

      await this.app.workspace.openLinkText(newTitle, "", false);
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      const editor = view.editor;
      editor.setCursor(editor.lastLine());
      editor.focus();
    } catch (err) {
      new Notice(`Unhandled error. Doing nothing`);
    }
  }
}
