import base64url from 'base64url'
import path from 'path'
import os from 'os'
import { promises as fs } from 'fs'
// import { execSync } from 'child_process'
const clipboardy = import('clipboardy')

const luafmt = require('lua-format')

const defaultTweakResult = {
	tweakKey: '',
	tweakValue: '',
	isChanged: false,
	order: 0,
	oldSize: 0,
	newSize: 0,
}

async function base64ToLua(readDir: string, writeDir: string) {
	await fs.mkdir(writeDir, { recursive: true })

	return processDirectory(readDir, writeDir, 'lua', base64UrlFileToLua)
}

async function luaToBase64(readDir: string, writeDir: string) {
	await fs.mkdir(writeDir, { recursive: true })

	return processDirectory(readDir, writeDir, 'base64url', luaFileToBase64Url)
}

type tweakResult = {
	tweakKey: string
	tweakValue: string
	isChanged: boolean
	order: number
	oldSize: number
	newSize: number
}

async function processDirectory(
	srcDir: string,
	destDir: string,
	toFileExtension: string,
	convertFunction: (
		srcPath: string,
		destPath: string,
		tweakKey: string,
		order: number,
	) => Promise<tweakResult>,
) {
	// Ensure destination directory exists
	await fs.mkdir(destDir, { recursive: true }).catch(() => {})

	const entries = await fs.readdir(srcDir, { withFileTypes: true })

	console.log(
		`Processing ${entries.length} entries from ${srcDir} to ${destDir}...`,
	)

	let conversions: Promise<tweakResult>[] = []
	let orderIndex = 0

	for (const entry of entries) {
		const srcPath = path.join(srcDir, entry.name)

		if (entry.isDirectory()) {
			// Create corresponding directory in destination
			const nestedDestDir = path.join(destDir, entry.name)
			await fs.mkdir(nestedDestDir, { recursive: true }).catch(() => {})

			// Use the directory name as the tweakKey for all files in this directory
			const tweakKey = entry.name

			// Process files in this subdirectory
			const subEntries = await fs.readdir(srcPath, { withFileTypes: true })
			for (const subEntry of subEntries) {
				if (!subEntry.isDirectory()) {
					// Only process files, not nested directories
					const subSrcPath = path.join(srcPath, subEntry.name)
					const destBaseFileName = subEntry.name
						.split('.')
						.slice(0, -1)
						.join('.')
					const subDestPath = path.join(
						nestedDestDir,
						`${destBaseFileName}.${toFileExtension}`,
					)

					conversions.push(
						convertFunction(subSrcPath, subDestPath, tweakKey, orderIndex++),
					)
				}
			}
		} else {
			// Process file in the root directory
			const destBaseFileName = entry.name.split('.').slice(0, -1).join('.')
			const destPath = path.join(
				destDir,
				`${destBaseFileName}.${toFileExtension}`,
			)

			conversions.push(
				convertFunction(
					srcPath,
					destPath,
					entry.name.split('.')[0],
					orderIndex++,
				),
			)
		}
	}

	const results = await Promise.all(conversions)

	return results.sort((a, b) => a.order - b.order)
}

async function base64UrlFileToLua(
	srcPath: string,
	destPath: string,
	tweakKey: string,
	order: number,
): Promise<tweakResult> {
	try {
		const srcContent = (await fs.readFile(srcPath, 'utf-8')).trim()
		if (!srcContent) return Promise.resolve({ ...defaultTweakResult, order })

		const decoded =
			(destPath.includes('units') ? 'return ' : '') +
			base64url.decode(srcContent)
		let luaString = luafmt
			.Beautify(decoded, {
				RenameVariables: false,
				RenameGlobals: false,
				SolveMath: false,
			})
			.replace(/^[\s\S]*?\]\]\s*/, '')
			.replace(/;\s*\n/g, '\n')
			.replace(/"/g, "'")

		luaString += luaString.endsWith('\n') ? '' : '\n'

		const destContent = await fs.readFile(destPath, 'utf-8')

		return fs
			.writeFile(destPath, luaString, 'utf-8')
			.then(() => {
				return {
					tweakKey,
					tweakValue: luaString,
					isChanged: destContent !== luaString,
					order,
					oldSize: destContent?.length || 0,
					newSize: luaString.length,
				}
			})
			.catch((err) => {
				console.error(err)
				return {
					tweakKey,
					tweakValue: luaString,
					isChanged: true,
					order,
					oldSize: destContent?.length || 0,
					newSize: luaString.length,
				}
			})
	} catch (err) {
		console.error(err)
		return { ...defaultTweakResult, order }
	}
}

function extractTopComments(content: string) {
	const lines = content.split('\n')
	let commentString = ''

	for (let i = 0; i < Math.min(3, lines.length); i++) {
		const line = lines[i]
		if (/^\s*--.*/.test(line)) {
			commentString += line + '\n'
		} else {
			break
		}
	}

	return commentString
}

// async function _optimizeAst(luaCode: string): Promise<string> {
// 	try {
// 		// Call the Python AST optimizer script
// 		const astOptimizerPath = path.join(__dirname, 'ast_optimizer.py')
// 		const optimizedCode = execSync(`python3 ${astOptimizerPath}`, {
// 			input: luaCode,
// 			encoding: 'utf-8',
// 			timeout: 10000, // 10 second timeout
// 		})
// 
// 		return optimizedCode.trim()
// 	} catch (error) {
// 		console.warn(
// 			'AST optimization failed, falling back to original code:',
// 			(error as Error).message,
// 		)
// 		return luaCode
// 	}
// }

async function luaFileToBase64Url(
	srcPath: string,
	destPath: string,
	tweakKey: string,
	order: number,
) {
	console.log("Processing %s to %s", srcPath, destPath)

	const content = (await fs.readFile(srcPath, 'utf-8')).trim()
	if (!content) return Promise.resolve({ ...defaultTweakResult, order })

	let minified
	try {
		// const optimizedContent = destPath.includes('defs')
		// 	? await optimizeAst(content)
		// 	: content
		const optimizedContent = content

		// Extract top comments first (the first 3 lines starting with --).
		const topComments = extractTopComments(optimizedContent)
		
		// Remove all comments from content before minifying.
		// NOTE: lua-format (Herrtt/luamin.js) automatically adds a header comment block
		// to minified output with no option to disable it. We must strip comments from
		// the input to prevent them from being included, then add back only the top comments.
		let contentWithoutComments = optimizedContent
		// Remove multi-line block comments: --[[ ... --]].
		contentWithoutComments = contentWithoutComments.replace(/--\[\[[\s\S]*?--\]\]/g, '')
		// Remove single-line comments.
		contentWithoutComments = contentWithoutComments
			.split('\n')
			.filter(line => !/^\s*--.*/.test(line))
			.join('\n')
			.trim()

		const minifyOptions = {
			RenameVariables: true,
			RenameGlobals: false,
			SolveMath: true,
		}

		let minifiedCode = luafmt.Minify(contentWithoutComments, minifyOptions)

		// lua-format adds its own header comment block. Remove it and trim whitespace.
		minifiedCode = minifiedCode.replace(/--\[\[[\s\S]*?--\]\]/g, '').trim()

		// Strip the 'return' keyword from all files (may or may not have space after it).
		minifiedCode = minifiedCode.replace(/^return\s*/, '')

		minified = topComments + minifiedCode
	} catch (err) {
		throw err;
	}

	const destContent = await fs.readFile(destPath, 'utf-8').catch(() => null)

	const tweakString = base64url.encode(minified)

	return fs
		.writeFile(destPath, tweakString, 'utf-8')
		.then(() => {
			return {
				tweakKey,
				tweakValue: tweakString,
				isChanged: destContent !== tweakString,
				order,
				oldSize: destContent?.length ?? 0,
				newSize: tweakString.length,
			}
		})
		.catch((err) => {
			console.error(err)
			return {
				tweakKey,
				tweakValue: tweakString,
				isChanged: true,
				order,
				oldSize: destContent?.length ?? 0,
				newSize: tweakString.length,
			}
		})
}

// function _normalizeLuaFileArgument(input: string): string {
// 	const base = input.replace(/\.lua$/, '')
// 	const name = base.startsWith('tweak') ? base : 'tweak' + base
// 	return name
// }

async function main() {
	if (process.argv.length <= 2) {
		console.error('Usage: ts-node converter.ts ')
		return
	}

	// let rawExclusiveKey = ''
	// if (process.argv.length == 4) {
	// 	const normalized = normalizeLuaFileArgument(process.argv[3].trim())
	// 	if (/^tweak(defs|units)\d*$/.test(normalized)) {
	// 		rawExclusiveKey = normalized
	// 	}
	// }

	if (process.argv[2] === 'b64tolua') {
		await base64ToLua(
			path.join(__dirname, '../base64url'),
			path.join(__dirname, '../lua'),
		)
	} else if (process.argv[2] === 'luatob64') {
		const miscTweaks = await luaToBase64(
			path.join(__dirname, '../misc_lua'),
			path.join(__dirname, '../misc_base64url'),
		)

		const b64Tweaks = await luaToBase64(
			path.join(__dirname, '../lua'),
			path.join(__dirname, '../base64url'),
		)

		const filteredTweaks = [...b64Tweaks, ...miscTweaks].filter(
			({ tweakKey }) =>
				process.argv.length == 4 && tweakKey.includes(process.argv[3].trim()),
		)

		const clipboardContent =
			filteredTweaks.length < [...b64Tweaks, ...miscTweaks].length &&
			filteredTweaks.length > 0
				? filteredTweaks[0].tweakValue
				: b64Tweaks
						.map(
							({ tweakKey, tweakValue }) => `!bset ${tweakKey} ${tweakValue}`,
						)
						.join('\n')

		// Write clipboard content to a file if running in container
		if (process.env.CONTAINER_FILE_OUTPUT) {
			const clipboardDir =
				process.env.NODE_ENV === 'container' || process.cwd().startsWith('/app')
					? '/app/clipboard'
					: os.tmpdir()
			const clipboardFilePath = path.join(clipboardDir, 'clipboard-content.txt')
			await fs.writeFile(clipboardFilePath, clipboardContent, 'utf-8')
		} else {
			// if running locally
			try {
				;(await clipboardy).default.writeSync(clipboardContent)
			} catch (err) {
				console.error('Failed to write to local clipboard')
			}
		}

		b64Tweaks.sort((a, b) => b.newSize - a.newSize)

		const largestByKey = new Map()

		b64Tweaks.forEach((item) => {
			if (!largestByKey.has(item.tweakKey)) {
				largestByKey.set(item.tweakKey, item)
			}
		})

		const filteredResults = Array.from(largestByKey.values())

		console.log(
			`Total size of all tweaks: ${filteredResults.reduce(
				(a, b) => a + b.oldSize,
				0,
			)} -> ${filteredResults.reduce(
				(a, b) => a + b.newSize,
				0,
			)} characters.\n\t${filteredResults
				.map(
					({ newSize, oldSize, tweakKey }) =>
						`${String(oldSize).padStart(5, ' ')} -> ${String(newSize).padStart(
							5,
							' ',
						)} ${tweakKey}`,
				)
				.join('\n\t')}`,
		)
	} else {
		console.error('Usage: ts-node ./scripts/converter.ts b64tolua|luatob64')
	}
}

main()
