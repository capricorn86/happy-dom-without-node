/* eslint-disable no-console*/
/* eslint-disable @typescript-eslint/no-var-requires*/

const Path = require('path');
const FS = require('fs');
const ESBuild = require('esbuild');
const { chromium } = require('playwright');

process.on('unhandledRejection', (reason) => {
	console.error(reason);
	process.exit(1);
});

main();

async function esbuild() {
	const tmpDirectory = Path.resolve('tmp');

	try {
		await FS.promises.mkdir(tmpDirectory);
	} catch (error) {
		// Ignore error
	}

	await FS.promises.writeFile(
		Path.join(tmpDirectory, 'entry.js'),
		`
        import { Window } from '../dist/lib/index.js';

        const window = new Window();

        window.document.body.innerHTML = '<h1>Hello World</h1>';

        globalThis.document.body.innerHTML = window.document.body.innerHTML;
    `
	);

	await await ESBuild.build({
		entryPoints: [Path.join(tmpDirectory, 'entry.js')],
		bundle: true,
		target: 'chrome100',
		outfile: Path.join(tmpDirectory, 'build.js')
	});

	const code = await FS.promises.readFile(Path.join(tmpDirectory, 'build.js'));
	await FS.promises.writeFile(
		Path.join(tmpDirectory, 'index.html'),
		`<html><body><script>${code}</script></body></html>`
	);

	return Path.join(tmpDirectory, 'index.html');
}

async function main() {
	const htmlFile = await esbuild();

	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto(`file:///${htmlFile}`);

	const element = await page.waitForSelector('h1');
	const innerText = await element.innerText();

	await browser.close();

	if (innerText !== 'Hello World') {
		throw Error('Unexpected innerText. Expected it to me "Hello World".');
	}
}
