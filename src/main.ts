import { Editor, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_TODO } from "./constants";
import { TodoItemView, TodoItemViewProps } from "./ui/TodoItemView";
import { TodoItem, TodoItemStatus } from "./model/TodoItem";
import { TodoIndex } from "./model/TodoIndex";
import {
	TodoPlusSettings,
	DEFAULT_SETTINGS,
} from "./model/TodoPlusSettings";
import { SettingsTab } from "./ui/SettingsTab";

export default class TodoPlusPlugin extends Plugin {
	private todoIndex: TodoIndex;
	private view: TodoItemView;
	private settings: TodoPlusSettings;

	async onload(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);

		this.todoIndex = new TodoIndex(
			this.app.vault,
			this.settings.tagPrefix,
			this.onTodosChanged.bind(this),
		);

		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerView(VIEW_TYPE_TODO, (leaf: WorkspaceLeaf) => {
			const props: TodoItemViewProps = {
				todos: [],
				openFile: (filePath: string) => {
					const file =
						this.app.vault.getAbstractFileByPath(filePath) as TFile;
					if (!file) return;
					if (
						this.settings.openFilesInNewLeaf &&
						this.app.workspace.getActiveFile()
					) {
						this.app.workspace
							.getLeaf("split")
							.openFile(file);
					} else {
						this.app.workspace
							.getLeaf(false)
							.openFile(file);
					}
				},
				toggleTodo: (todo: TodoItem, newStatus: TodoItemStatus) => {
					this.todoIndex.setStatus(todo, newStatus);
				},
			};
			this.view = new TodoItemView(leaf, props);
			return this.view;
		});

		this.registerCommands();

		this.app.workspace.onLayoutReady(async () => {
			await this.initLeaf();
			await this.todoIndex.initialize();
		});
	}

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_TODO)
			.forEach((leaf) => leaf.detach());
	}

	getSettings(): TodoPlusSettings {
		return this.settings;
	}

	async updateSettings(settings: TodoPlusSettings): Promise<void> {
		const oldPrefix = this.settings.tagPrefix;
		this.settings = settings;
		await this.saveData(this.settings);

		if (oldPrefix !== settings.tagPrefix) {
			await this.todoIndex.setTagPrefix(settings.tagPrefix);
		}
	}

	private async initLeaf(): Promise<void> {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO).length) {
			return;
		}
		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({ type: VIEW_TYPE_TODO });
		}
	}

	private onTodosChanged(todos: TodoItem[]): void {
		if (!this.view) return;
		this.view.setProps((current: TodoItemViewProps) => ({
			...current,
			todos,
		}));
	}

	private registerCommands(): void {
		this.addCommand({
			id: "create-todo-inbox",
			name: "Create todo (Inbox)",
			editorCallback: (editor: Editor) => {
				this.insertTodo(editor, "inbox");
			},
		});

		this.addCommand({
			id: "create-todo-next",
			name: "Create todo (Next)",
			editorCallback: (editor: Editor) => {
				this.insertTodo(editor, "next");
			},
		});

		this.addCommand({
			id: "create-todo-waiting",
			name: "Create todo (Waiting)",
			editorCallback: (editor: Editor) => {
				this.insertTodo(editor, "waiting");
			},
		});

		this.addCommand({
			id: "create-todo-someday",
			name: "Create todo (Someday/Maybe)",
			editorCallback: (editor: Editor) => {
				this.insertTodo(editor, "maybe");
			},
		});

		this.addCommand({
			id: "create-todo-default",
			name: "Create todo",
			editorCallback: (editor: Editor) => {
				this.insertTodo(editor, this.settings.defaultGtdState);
			},
		});

		this.addCommand({
			id: "show-todo-panel",
			name: "Show TODO+ panel",
			callback: () => {
				this.initLeaf();
			},
		});
	}

	private insertTodo(editor: Editor, gtdState: string): void {
		const today = new Date().toISOString().split("T")[0];
		const prefix = this.settings.tagPrefix;
		const line = `- [ ] ${prefix}/${gtdState} ${prefix}/created:${today} `;
		const cursor = editor.getCursor();
		const isEmptyLine = cursor.ch === 0 && editor.getLine(cursor.line).length === 0;

		if (isEmptyLine) {
			editor.replaceRange(line, cursor);
			editor.setCursor({ line: cursor.line, ch: 6 });
		} else {
			editor.replaceRange("\n" + line, {
				line: cursor.line,
				ch: editor.getLine(cursor.line).length,
			});
			editor.setCursor({ line: cursor.line + 1, ch: 6 });
		}
	}
}
