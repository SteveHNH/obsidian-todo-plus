import { EventRef, TAbstractFile, TFile, Vault } from "obsidian";
import { TodoItem, TodoItemStatus } from "./TodoItem";
import { TodoParser } from "./TodoParser";

export class TodoIndex {
	private vault: Vault;
	private todos: Map<string, TodoItem[]>;
	private listeners: ((todos: TodoItem[]) => void)[];
	private parser: TodoParser;
	private eventRefs: EventRef[];

	constructor(
		vault: Vault,
		tagPrefix: string,
		listener: (todos: TodoItem[]) => void,
	) {
		this.vault = vault;
		this.todos = new Map<string, TodoItem[]>();
		this.listeners = [listener];
		this.parser = new TodoParser(tagPrefix);
		this.eventRefs = [];
	}

	async initialize(): Promise<void> {
		const todoMap = new Map<string, TodoItem[]>();
		let numberOfTodos = 0;
		const timeStart = Date.now();

		const markdownFiles = this.vault.getMarkdownFiles();
		for (const file of markdownFiles) {
			const todos = await this.parseTodosInFile(file);
			numberOfTodos += todos.length;
			if (todos.length > 0) {
				todoMap.set(file.path, todos);
			}
		}

		const totalTimeMs = Date.now() - timeStart;
		console.log(
			`[todo-plus] Indexed ${numberOfTodos} todos from ${markdownFiles.length} files in ${totalTimeMs}ms`,
		);
		this.todos = todoMap;
		this.registerEventHandlers();
		this.invokeListeners();
	}

	async setTagPrefix(tagPrefix: string): Promise<void> {
		this.parser = new TodoParser(tagPrefix);
		await this.initialize();
	}

	async setStatus(todo: TodoItem, newStatus: TodoItemStatus): Promise<void> {
		const file = this.vault.getAbstractFileByPath(todo.sourceFilePath);
		if (!(file instanceof TFile)) {
			return;
		}

		const contents = await this.vault.read(file);
		const oldCheck = todo.status === TodoItemStatus.Done ? "x" : " ";
		const newCheck = newStatus === TodoItemStatus.Done ? "x" : " ";

		const expectedFragment = contents.substring(
			todo.startIndex,
			todo.startIndex + todo.length,
		);
		if (!expectedFragment.includes(`[${oldCheck}]`)) {
			console.warn(
				"[todo-plus] Stale index: file content at recorded offset does not match expected checkbox. Re-indexing.",
			);
			await this.indexFile(file);
			return;
		}

		const newLine = expectedFragment.replace(
			`[${oldCheck}]`,
			`[${newCheck}]`,
		);
		const newContents =
			contents.substring(0, todo.startIndex) +
			newLine +
			contents.substring(todo.startIndex + todo.length);
		await this.vault.modify(file, newContents);
	}

	private async parseTodosInFile(file: TFile): Promise<TodoItem[]> {
		const fileContents = await this.vault.cachedRead(file);
		return this.parser.parseTasks(file.path, fileContents);
	}

	private indexAbstractFile(file: TAbstractFile): void {
		if (!(file instanceof TFile)) {
			return;
		}
		this.indexFile(file as TFile);
	}

	private async indexFile(file: TFile): Promise<void> {
		const todos = await this.parseTodosInFile(file);
		if (todos.length > 0) {
			this.todos.set(file.path, todos);
		} else {
			this.todos.delete(file.path);
		}
		this.invokeListeners();
	}

	private registerEventHandlers(): void {
		this.unregisterEventHandlers();

		this.eventRefs.push(
			this.vault.on("create", (file: TAbstractFile) => {
				this.indexAbstractFile(file);
			}),
		);
		this.eventRefs.push(
			this.vault.on("modify", (file: TAbstractFile) => {
				this.indexAbstractFile(file);
			}),
		);
		this.eventRefs.push(
			this.vault.on("delete", (file: TAbstractFile) => {
				this.todos.delete(file.path);
				this.invokeListeners();
			}),
		);
		this.eventRefs.push(
			this.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
				this.todos.delete(oldPath);
				this.indexAbstractFile(file);
			}),
		);
	}

	private unregisterEventHandlers(): void {
		for (const ref of this.eventRefs) {
			this.vault.offref(ref);
		}
		this.eventRefs = [];
	}

	private invokeListeners(): void {
		const allTodos = ([] as TodoItem[]).concat(
			...Array.from(this.todos.values()),
		);
		this.listeners.forEach((listener) => listener(allTodos));
	}
}
