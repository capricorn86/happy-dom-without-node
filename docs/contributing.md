# Contributing Guide

We are very happy that you would like to contribute.

## Setup

### Install

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Watch

```bash
npm run watch
```

### Debugging

1. Go to the package you wish to test in the terminal (e.g. "cd ./packages/happy-dom")
2. Write "debugger;" at the place you want to place a breakpoint in the code.
3. Run the following command in the terminal:

```bash
npm run test:debug
```

4. Open Chrome.
5. Open developer tools.
6. A green ball should appear to the left of the menu bar in developer tools.
7. Click on the green ball.
8. Click continue to jump to your breakpoint.

### Test

##### Run all Tests

```bash
npm test
```

##### Watch Tests

```bash
npm run test:watch
```

## Branch

Branch names should have the pattern "{issueID}-name-of-branch".

## Commit Convention

We use the [Conventional Commits](https://www.conventionalcommits.org/en/) standard for our commit messages. The description should start with an uppercase character.

**Example**

```
fix: [#123] This is my commit message
```
