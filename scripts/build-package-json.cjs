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

function removeCJSExport(entry) {
	for (const key of Object.keys(entry)) {
		if (key.includes('cjs')) {
			delete entry[key];
		}
		if (typeof entry[key] === 'string' && entry[key].includes('cjs')) {
			delete entry[key];
		} else if (typeof entry[key] === 'object') {
			removeCJSExport(entry[key]);
		}
	}
}

async function main() {
	const args = getArguments();

	if (!args.dir) {
		throw new Error('Invalid arguments');
	}

	const directory = Path.resolve(args.dir);
	const packageJson = require('happy-dom/package.json');

	delete packageJson.scripts;
	delete packageJson.devDependencies;

	removeCJSExport(packageJson.exports);

	packageJson.name = 'happy-dom-without-node';
	packageJson.homepage = 'https://github.com/capricorn86/happy-dom-without-node/';
	packageJson.repository = 'https://github.com/capricorn86/happy-dom-without-node/';
	packageJson.dependencies['whatwg-url'] = '^14.0.0';

	await FS.promises.writeFile(
		Path.join(directory, 'package.json'),
		JSON.stringify(packageJson, null, '\t')
	);
}
