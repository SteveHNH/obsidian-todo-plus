export class TFile {
	path: string;
	constructor(path: string) {
		this.path = path;
	}
}

export class TAbstractFile {
	path: string;
	constructor(path: string) {
		this.path = path;
	}
}

export type EventRef = { event: string; callback: (...args: any[]) => void };

export class Vault {
	getMarkdownFiles(): TFile[] {
		return [];
	}
	cachedRead(_file: TFile): Promise<string> {
		return Promise.resolve("");
	}
	read(_file: TFile): Promise<string> {
		return Promise.resolve("");
	}
	modify(_file: TFile, _contents: string): Promise<void> {
		return Promise.resolve();
	}
	getAbstractFileByPath(_path: string): TAbstractFile | null {
		return null;
	}
	on(event: string, callback: (...args: any[]) => void): EventRef {
		return { event, callback };
	}
	offref(_ref: EventRef): void {}
}

export class Plugin {
	app: any;
	manifest: any;
	loadData(): Promise<any> {
		return Promise.resolve({});
	}
	saveData(_data: any): Promise<void> {
		return Promise.resolve();
	}
	addCommand(_command: any): void {}
	addSettingTab(_tab: any): void {}
	registerView(_type: string, _factory: any): void {}
}

export class PluginSettingTab {}
export class ItemView {
	containerEl: any = { children: [null, { empty: () => {}, createDiv: () => {} }] };
	constructor(_leaf: any) {}
}
export class WorkspaceLeaf {}
export class App {}
export class Setting {
	constructor(_el: any) {}
	setName(_name: string): this { return this; }
	setDesc(_desc: string): this { return this; }
	addText(_cb: any): this { return this; }
	addDropdown(_cb: any): this { return this; }
	addToggle(_cb: any): this { return this; }
}
export class MarkdownRenderer {
	static renderMarkdown(_src: string, _el: any, _path: string, _component: any): void {}
}
export class Editor {}
