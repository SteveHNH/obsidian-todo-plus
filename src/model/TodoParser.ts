import { TodoItem, TodoItemStatus, GtdState } from "./TodoItem";

export class TodoParser {
	private tagPrefix: string;

	constructor(tagPrefix: string = "#todo") {
		this.tagPrefix = tagPrefix;
	}

	parseTasks(filePath: string, fileContents: string): TodoItem[] {
		const todos: TodoItem[] = [];
		const tagPattern = new RegExp(
			this.escapeRegex(this.tagPrefix) + "\\/(\\S+)",
			"g",
		);

		let match: RegExpExecArray | null;
		const checkboxPattern = /^([-*] \[( |x)\] .+)$/gm;

		while ((match = checkboxPattern.exec(fileContents)) !== null) {
			const fullLine = match[1] ?? "";
			const checked = match[2] ?? " ";

			const tags = this.extractTags(fullLine, tagPattern);
			if (tags.length === 0) {
				continue;
			}

			const status =
				checked === "x" ? TodoItemStatus.Done : TodoItemStatus.Todo;
			const description = fullLine.replace(/^[-*] \[( |x)\] /, "");
			const gtdState = this.resolveGtdState(tags);
			const dueDate = this.extractDateTag(tags, "due");
			const createdDate = this.extractDateTag(tags, "created");
			const completedDate = this.extractDateTag(tags, "done");

			const startIndex = match.index!;
			const length = match[0].length;

			todos.push(
				new TodoItem(
					status,
					description,
					gtdState,
					filePath,
					startIndex,
					length,
					dueDate,
					createdDate,
					completedDate,
				),
			);
		}

		return todos;
	}

	private extractTags(
		text: string,
		tagPattern: RegExp,
	): string[] {
		const tags: string[] = [];
		const pattern = new RegExp(tagPattern.source, tagPattern.flags);
		let tagMatch: RegExpExecArray | null;
		while ((tagMatch = pattern.exec(text)) !== null) {
			tags.push(tagMatch[1]!);
		}
		return tags;
	}

	private resolveGtdState(tags: string[]): GtdState {
		const stateMap: Record<string, GtdState> = {
			inbox: GtdState.Inbox,
			next: GtdState.Next,
			waiting: GtdState.Waiting,
			maybe: GtdState.Someday,
			someday: GtdState.Someday,
		};

		for (const tag of tags) {
			const normalizedTag = tag.toLowerCase().split(":")[0]!;
			if (normalizedTag in stateMap) {
				return stateMap[normalizedTag]!;
			}
		}
		return GtdState.Inbox;
	}

	private extractDateTag(
		tags: string[],
		prefix: string,
	): string | undefined {
		for (const tag of tags) {
			if (tag.toLowerCase().startsWith(prefix + ":")) {
				return tag.substring(prefix.length + 1);
			}
		}
		return undefined;
	}

	private escapeRegex(str: string): string {
		return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
	}
}
