/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable consistent-return */

const Path = require('path');
const FS = require('fs');

process.on('unhandledRejection', (reason) => {
	console.error(reason);
	process.exit(1);
});

main();

const POLYFILL_MODULES = [
	'net',
	'crypto',
	'url',
	'stream',
	'stream/web',
	'vm',
	'buffer',
	'console'
];

const POLYFILL_TRANSPILERS = [
	function polyfillGlobals(_directory, _file, content) {
		return content
			.replace(/process\.platform/gm, `'Unknown'`)
			.replace(/process\.arch/gm, `'Unknown'`)
			.replace(/NodeJS\.Timeout/gm, `number`)
			.replace(/NodeJS\.Immediate/gm, `number`)
			.replace(/globalThis\.setImmediate/gm, `globalThis.setTimeout`)
			.replace(/globalThis\.clearImmediate/gm, `globalThis.clearTimeout`);
	},
	function polyfillFetch(_directory, file, content) {
		if (file.endsWith('/Fetch.d.ts') || file.endsWith('/SyncFetch.d.ts')) {
			return `export default class NotSupported { send(): Promise<void>; }`;
		}
		if (file.endsWith('/Fetch.js') || file.endsWith('/SyncFetch.js')) {
			return `export default class NotSupported { send() { throw Error('Fetch is not supported without Node.js.'); } }`;
		}
		if (file.includes('/fetch/') || file.includes('/xml-http-request/')) {
			if (file.endsWith('.d.ts')) {
				return `export default class NotSupported { }`;
			}
			return 'export default class NotSupported { }';
		}
		return content;
	},
	function polyfillTypescriptDefinition(_directory, file, content) {
		if (!file.endsWith('.d.ts')) {
			return content;
		}

		return content.replace(
			/\/\/\/\s*<reference\s+types="node"\s+resolution-mode="require"\/>/gm,
			''
		);
	},
	function polyfillIncorrectHTMLElementTagNameMapExtend(_directory, file, content) {
		if (!file.includes('HTMLElementTagNameMap')) {
			return content;
		}

		return content.replace(' extends HTMLElementTagNameMap', '');
	},
	function polyfillModules(directory, file, content) {
		const polyfillsDirectory = Path.join(directory, 'polyfills');
		let newContent = content;
		for (const module of POLYFILL_MODULES) {
			const regexp = new RegExp(
				`import.+from\\s*(["']${module}["'])|import\\((["']${module}["'])\\)`,
				'gm'
			);
			let match;

			while ((match = regexp.exec(content)) !== null) {
				const modulePath = Path.relative(Path.dirname(file), polyfillsDirectory) + `/${module}.js`;
				newContent = newContent.replace(
					match[0],
					match[0].replace(
						match[1] || match[2],
						`'${modulePath.startsWith('.') ? modulePath : `./${modulePath}`}'`
					)
				);
			}
		}
		return newContent;
	}
];

function getArguments() {
	const args = {
		dir: null
	};

	for (const arg of process.argv) {
		if (arg.startsWith('--dir=')) {
			args.dir = arg.split('=')[1];
		}
	}

	return args;
}

async function readDirectory(directory) {
	const files = await FS.promises.readdir(directory);
	const statsPromises = [];
	let allFiles = [];

	for (const file of files) {
		const filePath = Path.join(directory, file);
		statsPromises.push(
			FS.promises.stat(filePath).then((stats) => {
				if (stats.isDirectory()) {
					return readDirectory(filePath).then((files) => (allFiles = allFiles.concat(files)));
				}
				const extname = Path.extname(filePath);
				if (extname === '.js' || extname === '.ts') {
					allFiles.push(filePath);
				}
			})
		);
	}

	await Promise.all(statsPromises);

	return allFiles;
}

async function polyfillFiles(directory, files) {
	const writePromises = [];

	for (const file of files) {
		writePromises.push(
			FS.promises.readFile(file).then((content) => {
				const oldContent = content.toString();
				let newContent = oldContent;
				for (const transpiler of POLYFILL_TRANSPILERS) {
					newContent = transpiler(directory, file, newContent);
				}
				if (newContent === oldContent) {
					return;
				}
				return FS.promises.writeFile(file, newContent);
			})
		);
	}

	await Promise.all(writePromises);
}

async function main() {
	const args = getArguments();
	if (!args.dir) {
		throw new Error('Invalid arguments');
	}
	const directory = Path.resolve(args.dir);
	const files = await readDirectory(directory);
	await polyfillFiles(directory, files);
}
