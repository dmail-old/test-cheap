#!/usr/bin/env node

const { glob } = require("glob-gitignore")
const ignore = require("ignore")
const nodepath = require("path")
const { fork } = require("child_process")

const testFileInclude = ["src/**/*.test.*"]
const testFileExclude = []

const findFilesForTest = (location = process.cwd()) =>
	glob(testFileInclude, {
		nodir: true,
		cwd: nodepath.resolve(process.cwd(), location),
		ignore: ignore().add(testFileExclude)
	})

const runFile = file =>
	new Promise(resolve => {
		console.log(`fork ${file}`)
		const child = fork(file, [], {
			execArgv: []
		})
		child.on("close", () => resolve())
	})

const runFiles = files =>
	files.reduce((previous, file) => previous.then(() => runFile(file)), Promise.resolve())

findFilesForTest().then(runFiles, e =>
	setTimeout(() => {
		throw e
	})
)
