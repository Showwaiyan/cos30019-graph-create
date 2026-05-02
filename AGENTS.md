# AGENTS.md

## Commands

- **Run tests**: `npm test` (uses Jest with `--experimental-vm-modules`)
- **Open app**: Open `index.html` in a browser (no build step required)

## Architecture

- Single-page HTML/JS app with no build system
- Entry point: `index.html` → loads `src/app.js` and `css/style.css`
- Main logic in `src/app.js`: `GraphState` class, `Renderer` class, `parseGraph()`, `exportGraph()`

## Graph Format (Map1.txt)

```
1              // start node
5;7            // destination nodes (semicolon-separated)
1:(1,4)        // node id:(x,y)
1,2,9         // edge: from,to,cost
```

## Known Issues

- Tests import from `src/parser.js` and `src/graph.js` but only `src/app.js` exists. Tests likely need fixing.
- Tests have ES module imports but the codebase uses `"type": "module"` in package.json.

## Config

- Uses superpowers plugin: `opencode.json` references `superpowers@git+https://github.com/obra/superpowers.git`