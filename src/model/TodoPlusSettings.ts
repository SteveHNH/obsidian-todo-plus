export interface TodoPlusSettings {
	tagPrefix: string;
	dateFormat: string;
	defaultGtdState: string;
	openFilesInNewLeaf: boolean;
}

export const DEFAULT_SETTINGS: TodoPlusSettings = {
	tagPrefix: "#todo",
	dateFormat: "yyyy-MM-dd",
	defaultGtdState: "inbox",
	openFilesInNewLeaf: true,
};
