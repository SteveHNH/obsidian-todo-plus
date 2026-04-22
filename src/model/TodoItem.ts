export enum TodoItemStatus {
	Todo,
	Done,
}

export enum GtdState {
	Inbox = "inbox",
	Next = "next",
	Waiting = "waiting",
	Someday = "maybe",
}

export class TodoItem {
	status: TodoItemStatus;
	description: string;
	gtdState: GtdState;
	sourceFilePath: string;
	startIndex: number;
	length: number;
	dueDate?: string;
	createdDate?: string;
	completedDate?: string;

	constructor(
		status: TodoItemStatus,
		description: string,
		gtdState: GtdState,
		sourceFilePath: string,
		startIndex: number,
		length: number,
		dueDate?: string,
		createdDate?: string,
		completedDate?: string,
	) {
		this.status = status;
		this.description = description;
		this.gtdState = gtdState;
		this.sourceFilePath = sourceFilePath;
		this.startIndex = startIndex;
		this.length = length;
		this.dueDate = dueDate;
		this.createdDate = createdDate;
		this.completedDate = completedDate;
	}

	get displayDescription(): string {
		return this.description
			.replace(/#todo\/\S+/g, "")
			.trim();
	}
}
