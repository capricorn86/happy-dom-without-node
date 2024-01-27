![Happy DOM Logo](https://github.com/capricorn86/happy-dom/raw/master/docs/happy-dom-logo.jpg)

# About

[Happy DOM](https://github.com/capricorn86/happy-dom) is a JavaScript implementation of a web browser without its graphical user interface. It includes many web standards from WHATWG [DOM](https://dom.spec.whatwg.org/) and [HTML](https://html.spec.whatwg.org/multipage/).

The goal of [Happy DOM](https://github.com/capricorn86/happy-dom) is to emulate enough of a web browser to be useful for testing, scraping web sites and server-side rendering.

[Happy DOM](https://github.com/capricorn86/happy-dom) focuses heavily on performance and can be used as an alternative to [JSDOM](https://github.com/jsdom/jsdom).

This package makes it possible to use Happy DOM in an environment without Node.js. Some functionality such as HTTP requests is not supported by this package yet.

As VM is part of Node.js, this package does not support running JavaScript in a sandbox. Javascript will be executed in the global scope.

### Module Systems

- [ESM](https://nodejs.org/api/esm.html#introduction)

# Installation

```bash
npm install happy-dom-without-node
```

# Usage

```javascript
import { Window } from 'happy-dom-without-node';

const window = new Window({ url: 'https://localhost:8080' });
const document = window.document;

document.body.innerHTML = '<div class="container"></div>';

const container = document.querySelector('.container');
const button = document.createElement('button');

container.appendChild(button);

// Outputs "<div class="container"><button></button></div>"
console.log(document.body.innerHTML);
```

# Contributing

See [Contributing Guide](https://github.com/capricorn86/happy-dom-without-node/blob/main/docs/contributing.md).
