#!/usr/bin/env node

const { glob } = require("glob-gitignore")
const ignore = require("ignore")
const nodepath = require("path")
const { fork } = require("child_process")

const testFileInclude = ["dist/**/*.test.*"]
const testFileExclude = ["dist/**/*.map"]

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
		child.on("close", status => resolve(status !== 0))
	})

const runFiles = files => {
	let someHasCrashed = false
	return files
		.reduce(
			(previous, file) =>
				previous.then(crashed => {
					if (crashed) {
						someHasCrashed = true
					}
					return runFile(file)
				}),
			Promise.resolve(false)
		)
		.then(() => someHasCrashed)
}

findFilesForTest()
	.then(runFiles)
	.then(
		someHasCrashed => process.exit(someHasCrashed ? 1 : 0),
		e =>
			setTimeout(() => {
				throw e
			})
	)
