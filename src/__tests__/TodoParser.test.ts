import { TodoParser } from "../model/TodoParser";
import { TodoItemStatus, GtdState } from "../model/TodoItem";

describe("TodoParser", () => {
	const parser = new TodoParser("#todo");

	describe("tag-gated filtering", () => {
		it("should only parse checkboxes with #todo/ tags", () => {
			const content = `
- [ ] Buy groceries
- [ ] Read the book #todo/inbox
- [x] Already done
- [ ] No tags here
- [ ] Future project #todo/maybe
`;
			const todos = parser.parseTasks("test.md", content);
			expect(todos).toHaveLength(2);
			expect(todos[0]!.displayDescription).toBe("Read the book");
			expect(todos[1]!.displayDescription).toBe("Future project");
		});

		it("should ignore checkboxes without any #todo/ tag", () => {
			const content = `
- [ ] Just a plain checkbox
- [x] Completed plain checkbox
* [ ] Another plain one
`;
			const todos = parser.parseTasks("test.md", content);
			expect(todos).toHaveLength(0);
		});
	});

	describe("GTD state resolution", () => {
		it("should detect inbox state", () => {
			const content = "- [ ] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos).toHaveLength(1);
			expect(todos[0]!.gtdState).toBe(GtdState.Inbox);
		});

		it("should detect next state", () => {
			const content = "- [ ] Task #todo/next";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.gtdState).toBe(GtdState.Next);
		});

		it("should detect waiting state", () => {
			const content = "- [ ] Task #todo/waiting";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.gtdState).toBe(GtdState.Waiting);
		});

		it("should detect someday/maybe state from #todo/maybe", () => {
			const content = "- [ ] Task #todo/maybe";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.gtdState).toBe(GtdState.Someday);
		});

		it("should detect someday/maybe state from #todo/someday", () => {
			const content = "- [ ] Task #todo/someday";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.gtdState).toBe(GtdState.Someday);
		});

		it("should default to Inbox when no GTD state tag is present", () => {
			const content = "- [ ] Task #todo/due:2024-01-15";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.gtdState).toBe(GtdState.Inbox);
		});
	});

	describe("date extraction", () => {
		it("should extract due date", () => {
			const content = "- [ ] Task #todo/inbox #todo/due:2024-06-15";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.dueDate).toBe("2024-06-15");
		});

		it("should extract created date", () => {
			const content = "- [ ] Task #todo/inbox #todo/created:2024-01-01";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.createdDate).toBe("2024-01-01");
		});

		it("should extract completed date", () => {
			const content = "- [x] Task #todo/inbox #todo/done:2024-03-20";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.completedDate).toBe("2024-03-20");
		});

		it("should handle multiple date tags", () => {
			const content =
				"- [ ] Task #todo/next #todo/created:2024-01-01 #todo/due:2024-12-31";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.createdDate).toBe("2024-01-01");
			expect(todos[0]!.dueDate).toBe("2024-12-31");
		});
	});

	describe("checkbox status", () => {
		it("should detect unchecked as Todo", () => {
			const content = "- [ ] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.status).toBe(TodoItemStatus.Todo);
		});

		it("should detect checked as Done", () => {
			const content = "- [x] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.status).toBe(TodoItemStatus.Done);
		});
	});

	describe("source tracking", () => {
		it("should track source file path", () => {
			const content = "- [ ] Task #todo/inbox";
			const todos = parser.parseTasks("notes/daily.md", content);
			expect(todos[0]!.sourceFilePath).toBe("notes/daily.md");
		});

		it("should track start index and length", () => {
			const content = "- [ ] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.startIndex).toBe(0);
			expect(todos[0]!.length).toBe(content.length);
		});
	});

	describe("bullet style support", () => {
		it("should support dash bullets", () => {
			const content = "- [ ] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos).toHaveLength(1);
		});

		it("should support asterisk bullets", () => {
			const content = "* [ ] Task #todo/inbox";
			const todos = parser.parseTasks("test.md", content);
			expect(todos).toHaveLength(1);
		});
	});

	describe("display description", () => {
		it("should strip all #todo/ tags from display", () => {
			const content =
				"- [ ] Write report #todo/next #todo/due:2024-06-15 #todo/created:2024-01-01";
			const todos = parser.parseTasks("test.md", content);
			expect(todos[0]!.displayDescription).toBe("Write report");
		});
	});

	describe("custom tag prefix", () => {
		it("should support custom tag prefix", () => {
			const customParser = new TodoParser("#gtd");
			const content = "- [ ] Task #gtd/inbox";
			const todos = customParser.parseTasks("test.md", content);
			expect(todos).toHaveLength(1);
			expect(todos[0]!.gtdState).toBe(GtdState.Inbox);
		});

		it("should not match default prefix when custom is set", () => {
			const customParser = new TodoParser("#gtd");
			const content = "- [ ] Task #todo/inbox";
			const todos = customParser.parseTasks("test.md", content);
			expect(todos).toHaveLength(0);
		});
	});

	describe("multi-line documents", () => {
		it("should parse todos scattered across a document", () => {
			const content = `# Project Notes

Some regular text here.

## Tasks

- [ ] First task #todo/inbox
- [ ] Plain checkbox (no tag)
- [x] Done task #todo/next #todo/done:2024-03-01

More text.

- [ ] Another task #todo/waiting #todo/due:2024-07-01

## Other Section

* [ ] Someday thing #todo/maybe
`;
			const todos = parser.parseTasks("project.md", content);
			expect(todos).toHaveLength(4);
			expect(todos[0]!.gtdState).toBe(GtdState.Inbox);
			expect(todos[1]!.status).toBe(TodoItemStatus.Done);
			expect(todos[1]!.gtdState).toBe(GtdState.Next);
			expect(todos[2]!.gtdState).toBe(GtdState.Waiting);
			expect(todos[2]!.dueDate).toBe("2024-07-01");
			expect(todos[3]!.gtdState).toBe(GtdState.Someday);
		});
	});
});
