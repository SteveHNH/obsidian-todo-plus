import { App, PluginSettingTab, Setting } from "obsidian";
import type TodoPlusPlugin from "../main";
import { DEFAULT_SETTINGS } from "../model/TodoPlusSettings";

export class SettingsTab extends PluginSettingTab {
	private plugin: TodoPlusPlugin;

	constructor(app: App, plugin: TodoPlusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.plugin.getSettings();

		containerEl.empty();
		containerEl.createEl("h2", { text: "TODO+ Settings" });

		new Setting(containerEl)
			.setName("Tag prefix")
			.setDesc(
				"The tag prefix used to identify GTD items. Tags like prefix/inbox, prefix/next, etc. will be recognized.",
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.tagPrefix)
					.setValue(settings.tagPrefix)
					.onChange(async (value) => {
						const tagPrefix = value.length > 0 ? value : DEFAULT_SETTINGS.tagPrefix;
						await this.plugin.updateSettings({
							...settings,
							tagPrefix,
						});
					}),
			);

		new Setting(containerEl)
			.setName("Date format")
			.setDesc(
				"The date format used for due dates and creation dates (e.g., yyyy-MM-dd).",
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.dateFormat)
					.setValue(settings.dateFormat)
					.onChange(async (value) => {
						const dateFormat = value.length > 0 ? value : DEFAULT_SETTINGS.dateFormat;
						await this.plugin.updateSettings({
							...settings,
							dateFormat,
						});
					}),
			);

		new Setting(containerEl)
			.setName("Default GTD state")
			.setDesc(
				"The default GTD state for new todos created via the command.",
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("inbox", "Inbox")
					.addOption("next", "Next")
					.addOption("waiting", "Waiting")
					.addOption("maybe", "Someday / Maybe")
					.setValue(settings.defaultGtdState)
					.onChange(async (value) => {
						await this.plugin.updateSettings({
							...settings,
							defaultGtdState: value,
						});
					}),
			);

		new Setting(containerEl)
			.setName("Open files in new leaf")
			.setDesc(
				"When clicking a todo to reveal its source file, open it in a new pane instead of replacing the current one.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.openFilesInNewLeaf)
					.onChange(async (value) => {
						await this.plugin.updateSettings({
							...settings,
							openFilesInNewLeaf: value,
						});
					}),
			);
	}
}
