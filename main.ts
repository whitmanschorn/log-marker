import { MarkdownView, CachedMetadata, Notice, Plugin, TFile } from "obsidian";

const FILE_EXTENSION = ".md";
const NEWLINE = "\n\n";

export default class DailyEntryPlugin extends Plugin {
  async onload() {
    const ribbonIconEl = this.addRibbonIcon(
      "dice",
      "Log Entry",
      (evt: MouseEvent) => this.createAndAppend(),
    );

    this.addCommand({
      id: "add-log",
      name: "Add Log Marker",
      callback: () => {
        this.createAndAppend();
      },
    });

  }

  onunload() {}

  async createAndAppend() {
    try {
      const getCurrentDate = () =>
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      const getCurrentTime = () =>
        new Date()
          .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
          .replace(/AM|PM/, (match) => match.toLowerCase())
          .replace(" ", "");

      const todaysDate = getCurrentDate();
      const currentTime = getCurrentTime();
      const newContent = `${currentTime}${NEWLINE}`;
      const newTitle = todaysDate;

      // Check if file exists already
      let baseTitleName = newTitle;
      if (baseTitleName.includes("/")) {
        const pathParts = baseTitleName.split("/");
        baseTitleName = pathParts[pathParts.length - 1];
      }

      const files = this.app.vault
        .getMarkdownFiles()
        .filter((item) => item.basename === baseTitleName);

      // Append content or create a new file
      if (files.length === 0) {
        new Notice(`Creating file and appending timestamp...`);
        await this.app.vault.create(`${newTitle}${FILE_EXTENSION}`, newContent);
      } else {
        const fileWithName = files[0];
        new Notice(`File already exists. Appending content...`);
        const fullExistingFileText = await this.app.vault.read(fileWithName);
        await this.app.vault.modify(
          fileWithName,
          `${fullExistingFileText}${NEWLINE}${newContent}`,
        );
      }

      await this.app.workspace.openLinkText(newTitle, "", false);
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      const editor = view!.editor;
      editor.setCursor(editor.lastLine());
      editor.focus();
    } catch (err) {
      console.error(err);
      new Notice(`Unhandled error. Doing nothing`);
    }
  }
}
