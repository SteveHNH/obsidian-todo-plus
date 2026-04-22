module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	moduleNameMapper: {
		"^obsidian$": "<rootDir>/src/__mocks__/obsidian.ts",
	},
	transform: {
		"^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
	},
};
