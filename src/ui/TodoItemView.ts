import { ItemView, MarkdownRenderer, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_TODO } from "../constants";
import { TodoItem, TodoItemStatus, GtdState } from "../model/TodoItem";
import { RenderIcon, Icon } from "./icons";

enum TodoItemViewPane {
	Inbox,
	Next,
	Waiting,
	Someday,
}

export interface TodoItemViewProps {
	todos: TodoItem[];
	openFile: (filePath: string) => void;
	toggleTodo: (todo: TodoItem, newStatus: TodoItemStatus) => void;
}

export class TodoItemView extends ItemView {
	private props: TodoItemViewProps;
	private activePane: TodoItemViewPane;

	constructor(leaf: WorkspaceLeaf, props: TodoItemViewProps) {
		super(leaf);
		this.props = props;
		this.activePane = TodoItemViewPane.Inbox;
	}

	getViewType(): string {
		return VIEW_TYPE_TODO;
	}

	getDisplayText(): string {
		return "TODO+";
	}

	getIcon(): string {
		return "check-square";
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}

	setProps(setter: (currentProps: TodoItemViewProps) => TodoItemViewProps): void {
		this.props = setter(this.props);
		this.render();
	}

	private setActivePane(pane: TodoItemViewPane): void {
		this.activePane = pane;
		this.render();
	}

	private render(): void {
		const container = this.containerEl.children[1];
		if (!container) return;
		container.empty();

		container.createDiv("todo-plus-container", (el) => {
			el.createDiv("todo-plus-toolbar", (toolbar) => {
				this.renderToolbar(toolbar);
			});
			el.createDiv("todo-plus-items", (items) => {
				this.renderItems(items);
			});
		});
	}

	private renderToolbar(container: HTMLDivElement): void {
		const tabs: {
			pane: TodoItemViewPane;
			icon: Icon;
			label: string;
		}[] = [
			{ pane: TodoItemViewPane.Inbox, icon: Icon.Inbox, label: "Inbox" },
			{ pane: TodoItemViewPane.Next, icon: Icon.Next, label: "Next" },
			{
				pane: TodoItemViewPane.Waiting,
				icon: Icon.Waiting,
				label: "Waiting",
			},
			{
				pane: TodoItemViewPane.Someday,
				icon: Icon.Someday,
				label: "Someday",
			},
		];

		for (const tab of tabs) {
			const activeClass =
				tab.pane === this.activePane ? " active" : "";
			container.createDiv(
				`todo-plus-toolbar-item${activeClass}`,
				(el) => {
					el.appendChild(RenderIcon(tab.icon, tab.label));
					el.onClickEvent(() => this.setActivePane(tab.pane));
				},
			);
		}
	}

	private renderItems(container: HTMLDivElement): void {
		const filtered = this.props.todos
			.filter((todo) => this.filterForPane(todo))
			.sort((a, b) => this.sortTodos(a, b));

		if (filtered.length === 0) {
			container.createDiv("todo-plus-empty", (el) => {
				el.setText(this.emptyMessage());
			});
			return;
		}

		for (const todo of filtered) {
			container.createDiv("todo-plus-item", (el) => {
				el.createDiv("todo-plus-item-checkbox", (checkEl) => {
					checkEl.createEl("input", { type: "checkbox" }, (input) => {
						input.checked = todo.status === TodoItemStatus.Done;
						input.onClickEvent(() => {
							const newStatus =
								todo.status === TodoItemStatus.Done
									? TodoItemStatus.Todo
									: TodoItemStatus.Done;
							this.props.toggleTodo(todo, newStatus);
						});
					});
				});

				el.createDiv("todo-plus-item-description", (descEl) => {
					MarkdownRenderer.renderMarkdown(
						todo.displayDescription,
						descEl,
						todo.sourceFilePath,
						this,
					);

					if (todo.dueDate) {
						descEl.createSpan("todo-plus-due-date", (span) => {
							const isOverdue = this.isOverdue(todo.dueDate!);
							const isFuture = this.isFuture(todo.dueDate!);
							if (isOverdue) span.classList.add("overdue");
							if (isFuture) span.classList.add("future");
							span.setText(todo.dueDate!);
						});
					}
				});

				el.createDiv("todo-plus-item-link", (linkEl) => {
					linkEl.appendChild(RenderIcon(Icon.Reveal, "Open file"));
					linkEl.onClickEvent(() => {
						this.props.openFile(todo.sourceFilePath);
					});
				});
			});
		}
	}

	private filterForPane(todo: TodoItem): boolean {
		switch (this.activePane) {
			case TodoItemViewPane.Inbox:
				return todo.gtdState === GtdState.Inbox;
			case TodoItemViewPane.Next:
				return todo.gtdState === GtdState.Next;
			case TodoItemViewPane.Waiting:
				return todo.gtdState === GtdState.Waiting;
			case TodoItemViewPane.Someday:
				return todo.gtdState === GtdState.Someday;
		}
	}

	private sortTodos(a: TodoItem, b: TodoItem): number {
		if (a.status !== b.status) {
			return a.status === TodoItemStatus.Todo ? -1 : 1;
		}
		if (a.dueDate && b.dueDate) {
			return a.dueDate.localeCompare(b.dueDate);
		}
		if (a.dueDate) return -1;
		if (b.dueDate) return 1;
		return 0;
	}

	private isOverdue(dateStr: string): boolean {
		const today = new Date().toISOString().split("T")[0]!;
		return dateStr < today;
	}

	private isFuture(dateStr: string): boolean {
		const today = new Date().toISOString().split("T")[0]!;
		return dateStr > today;
	}

	private emptyMessage(): string {
		switch (this.activePane) {
			case TodoItemViewPane.Inbox:
				return "Inbox is empty. Add #todo/inbox to a checkbox item.";
			case TodoItemViewPane.Next:
				return "No next actions. Add #todo/next to a checkbox item.";
			case TodoItemViewPane.Waiting:
				return "Nothing waiting. Add #todo/waiting to a checkbox item.";
			case TodoItemViewPane.Someday:
				return "No someday items. Add #todo/maybe to a checkbox item.";
		}
	}
}
