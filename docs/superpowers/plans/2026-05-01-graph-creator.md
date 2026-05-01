# Graph Creator Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based tool for creating interactive graphs on a grid, setting start/destination nodes, and exporting/importing graph data in the specific `Map1.txt` text format.

**Architecture:** A monolithic, vanilla HTML/JS/CSS frontend application. The state lives in a central JavaScript module (`src/graph.js`), which is manipulated by user interactions and then triggers an SVG re-render (`src/renderer.js`). A file parser handles text serialization/deserialization (`src/parser.js`). TDD is used for pure logic modules via Jest.

**Tech Stack:** Vanilla HTML/JS/CSS, SVG for rendering, Jest for unit testing.

---

### Task 1: Project Scaffold & Setup

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `css/style.css`
- Create: `src/app.js`

- [ ] **Step 1: Initialize project and install Jest**
```bash
npm init -y
npm install --save-dev jest
```

- [ ] **Step 2: Update package.json scripts**
Modify `package.json` to add the test script:
```json
  "scripts": {
    "test": "jest"
  }
```

- [ ] **Step 3: Create initial HTML structure**
Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Graph Creator</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create base CSS and JS**
Create `css/style.css`:
```css
body { margin: 0; font-family: sans-serif; }
```
Create `src/app.js`:
```javascript
console.log("Graph Creator Initialized");
```

- [ ] **Step 5: Commit scaffolding**
```bash
git add package.json package-lock.json index.html css/style.css src/app.js
git commit -m "chore: scaffold project structure and install jest"
```

### Task 2: Core Graph Data Model (TDD)

**Files:**
- Create: `src/graph.js`
- Create: `tests/graph.test.js`

- [ ] **Step 1: Write the failing tests for Graph State**
Create `tests/graph.test.js`:
```javascript
import { GraphState } from '../src/graph.js';

describe('GraphState', () => {
    let graph;
    beforeEach(() => {
        graph = new GraphState();
    });

    test('initializes empty', () => {
        expect(graph.nodes).toEqual([]);
        expect(graph.edges).toEqual([]);
        expect(graph.startNode).toBeNull();
        expect(graph.destNodes).toEqual([]);
    });

    test('adds a node with auto ID', () => {
        const id1 = graph.addNode(1, 4);
        expect(id1).toBe(1);
        expect(graph.nodes).toEqual([{ id: 1, x: 1, y: 4 }]);

        const id2 = graph.addNode(4, 10);
        expect(id2).toBe(2);
        expect(graph.nodes).toEqual([
            { id: 1, x: 1, y: 4 },
            { id: 2, x: 4, y: 10 }
        ]);
    });

    test('removes a node and its associated edges', () => {
        graph.addNode(1, 4); // ID 1
        graph.addNode(4, 10); // ID 2
        graph.addEdge(1, 2, 5);
        graph.setStart(1);
        graph.toggleDest(2);
        
        graph.removeNode(1);
        
        expect(graph.nodes).toEqual([{ id: 2, x: 4, y: 10 }]);
        expect(graph.edges).toEqual([]);
        expect(graph.startNode).toBeNull(); // Start was removed
        expect(graph.destNodes).toEqual([2]); // Dest 2 remains
    });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/graph.test.js`
Expected: FAIL with "Cannot find module '../src/graph.js'"

- [ ] **Step 3: Write minimal implementation**
Create `src/graph.js`:
```javascript
export class GraphState {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.startNode = null;
        this.destNodes = [];
        this.nextNodeId = 1;
    }

    addNode(x, y) {
        const id = this.nextNodeId++;
        this.nodes.push({ id, x, y });
        return id;
    }

    removeNode(id) {
        this.nodes = this.nodes.filter(n => n.id !== id);
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
        if (this.startNode === id) this.startNode = null;
        this.destNodes = this.destNodes.filter(d => d !== id);
    }

    addEdge(from, to, cost) {
        // Prevent duplicate directed edges
        if (!this.edges.some(e => e.from === from && e.to === to)) {
            this.edges.push({ from, to, cost });
        }
    }

    removeEdge(from, to) {
        this.edges = this.edges.filter(e => !(e.from === from && e.to === to));
    }

    setStart(id) {
        this.startNode = id;
    }

    toggleDest(id) {
        if (this.destNodes.includes(id)) {
            this.destNodes = this.destNodes.filter(d => d !== id);
        } else {
            this.destNodes.push(id);
        }
    }

    clear() {
        this.nodes = [];
        this.edges = [];
        this.startNode = null;
        this.destNodes = [];
        this.nextNodeId = 1;
    }
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/graph.test.js`
Expected: PASS

- [ ] **Step 5: Commit Graph Data Model**
```bash
git add src/graph.js tests/graph.test.js
git commit -m "feat: implement core graph data model"
```

### Task 3: File Parsing & Export Logic (TDD)

**Files:**
- Create: `src/parser.js`
- Create: `tests/parser.test.js`

- [ ] **Step 1: Write the failing tests for Parser**
Create `tests/parser.test.js`:
```javascript
import { parseGraph, exportGraph } from '../src/parser.js';
import { GraphState } from '../src/graph.js';

describe('Graph Parser', () => {
    const sampleTxt = `1 // Starting node (origin) is Node 1
5;7 // Destination nodes are Node 5 and Node 7
1:(1,4) // Node 1 at (1,4)
2:(4,10)
5:(13,9)
7:(9,6)
1,2,9 // list of edges
1,5,7
2,7,5
`;

    test('parses Map1 format correctly', () => {
        const graph = parseGraph(sampleTxt);
        expect(graph.startNode).toBe(1);
        expect(graph.destNodes).toEqual([5, 7]);
        expect(graph.nodes.length).toBe(4);
        expect(graph.nodes.find(n => n.id === 2)).toEqual({ id: 2, x: 4, y: 10 });
        expect(graph.edges.length).toBe(3);
        expect(graph.edges.find(e => e.from === 1 && e.to === 2)).toEqual({ from: 1, to: 2, cost: 9 });
    });

    test('exports Map1 format correctly', () => {
        const graph = new GraphState();
        graph.nextNodeId = 3;
        graph.nodes = [{ id: 1, x: 1, y: 4 }, { id: 2, x: 4, y: 10 }];
        graph.edges = [{ from: 1, to: 2, cost: 9 }];
        graph.startNode = 1;
        graph.destNodes = [2];

        const output = exportGraph(graph);
        const expected = \`1 // Starting node
2 // Destination nodes
1:(1,4)
2:(4,10)
1,2,9 // list of edges\`;
        
        expect(output.trim()).toBe(expected.trim());
    });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/parser.test.js`
Expected: FAIL with "Cannot find module '../src/parser.js'"

- [ ] **Step 3: Write minimal implementation**
Create `src/parser.js`:
```javascript
import { GraphState } from './graph.js';

export function parseGraph(text) {
    const graph = new GraphState();
    const lines = text.split('\\n');
    let lineIdx = 0;

    // Helper to strip comments
    const strip = (str) => str.split('//')[0].trim();

    // Parse Start Node
    while (lineIdx < lines.length && !strip(lines[lineIdx])) lineIdx++;
    if (lineIdx < lines.length) {
        graph.setStart(parseInt(strip(lines[lineIdx]), 10));
        lineIdx++;
    }

    // Parse Destination Nodes
    while (lineIdx < lines.length && !strip(lines[lineIdx])) lineIdx++;
    if (lineIdx < lines.length) {
        const destStr = strip(lines[lineIdx]);
        if (destStr) {
            destStr.split(';').forEach(d => graph.toggleDest(parseInt(d, 10)));
        }
        lineIdx++;
    }

    let maxId = 0;

    // Parse Nodes and Edges
    for (; lineIdx < lines.length; lineIdx++) {
        const line = strip(lines[lineIdx]);
        if (!line) continue;

        if (line.includes(':')) {
            // Node line: ID:(X,Y)
            const [idPart, coordPart] = line.split(':');
            const id = parseInt(idPart, 10);
            const coords = coordPart.replace(/[()]/g, '').split(',');
            const x = parseInt(coords[0], 10);
            const y = parseInt(coords[1], 10);
            
            graph.nodes.push({ id, x, y });
            if (id > maxId) maxId = id;
        } else if (line.includes(',')) {
            // Edge line: From,To,Cost
            const [from, to, cost] = line.split(',').map(n => parseInt(n, 10));
            graph.addEdge(from, to, cost);
        }
    }
    
    graph.nextNodeId = maxId + 1;
    return graph;
}

export function exportGraph(graph) {
    let out = [];
    
    // Start node
    out.push(\`\${graph.startNode || ''} // Starting node\`);
    
    // Dest nodes
    out.push(\`\${graph.destNodes.join(';')} // Destination nodes\`);
    
    // Nodes
    graph.nodes.forEach(n => {
        out.push(\`\${n.id}:(\${n.x},\${n.y})\`);
    });
    
    // Edges
    graph.edges.forEach((e, idx) => {
        let suffix = idx === 0 ? ' // list of edges' : '';
        out.push(\`\${e.from},\${e.to},\${e.cost}\${suffix}\`);
    });

    return out.join('\\n');
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/parser.test.js`
Expected: PASS

- [ ] **Step 5: Commit File Parsing & Export Logic**
```bash
git add src/parser.js tests/parser.test.js
git commit -m "feat: implement map format parser and exporter"
```

### Task 4: UI Structure & Styling

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: Add HTML Structure**
Replace `index.html` content:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Graph Creator</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="toolbar">
        <div class="tools">
            <label><input type="radio" name="tool" value="addNode" checked> Add Node</label>
            <label><input type="radio" name="tool" value="addEdge"> Add Edge</label>
            <label><input type="radio" name="tool" value="setStart"> Set Start</label>
            <label><input type="radio" name="tool" value="setDest"> Set Dest</label>
            <label><input type="radio" name="tool" value="remove"> Remove</label>
        </div>
        <div class="actions">
            <button id="btn-import">Import TXT</button>
            <input type="file" id="file-import" accept=".txt" style="display: none;">
            <button id="btn-export">Export TXT</button>
        </div>
    </div>
    <div class="canvas-container">
        <svg id="graph-svg" width="100%" height="100%">
            <!-- Grid Pattern -->
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                </pattern>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <g id="edges-layer"></g>
            <g id="nodes-layer"></g>
        </svg>
    </div>
    <script type="module" src="src/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add CSS Styling**
Replace `css/style.css` content:
```css
body { margin: 0; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden;}
.toolbar { background: #f5f5f5; padding: 10px; display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; }
.tools label, .actions button { margin-right: 15px; cursor: pointer; }
.canvas-container { flex-grow: 1; position: relative; background: #fafafa; }
#graph-svg { display: block; }
.node circle { fill: #fff; stroke: #333; stroke-width: 2; cursor: pointer; }
.node circle:hover { stroke: #007bff; }
.node.start circle { stroke: #28a745; fill: #e8f5e9; stroke-width: 3; }
.node.dest circle { stroke: #dc3545; fill: #fdeadd; stroke-width: 3; }
.node.selected circle { stroke: #ffc107; fill: #fff3cd; }
.node text { pointer-events: none; font-size: 12px; text-anchor: middle; dominant-baseline: central; }
.edge line { stroke: #666; stroke-width: 2; cursor: pointer; }
.edge line:hover { stroke: #dc3545; stroke-width: 4; }
.edge text { pointer-events: none; font-size: 14px; fill: #333; font-weight: bold; background: white;}
```

- [ ] **Step 3: Commit UI Layout**
```bash
git add index.html css/style.css
git commit -m "ui: implement toolbar and svg canvas container"
```

### Task 5: SVG Rendering Engine

**Files:**
- Create: `src/renderer.js`

- [ ] **Step 1: Write renderer implementation**
Create `src/renderer.js`:
```javascript
export const GRID_SIZE = 40;

export class Renderer {
    constructor(svgElement, graphState) {
        this.svg = svgElement;
        this.nodesLayer = svgElement.querySelector('#nodes-layer');
        this.edgesLayer = svgElement.querySelector('#edges-layer');
        this.graph = graphState;
        
        // Logical origin to visual mapping (bottom-left origin)
        this.getVisualCoords = (x, y) => {
            const h = this.svg.clientHeight || window.innerHeight - 50; // Fallback height
            return {
                vx: x * GRID_SIZE,
                vy: h - (y * GRID_SIZE)
            };
        };
    }

    render(selectedNodeId = null) {
        this.nodesLayer.innerHTML = '';
        this.edgesLayer.innerHTML = '';

        // Draw edges
        this.graph.edges.forEach(edge => {
            const fromNode = this.graph.nodes.find(n => n.id === edge.from);
            const toNode = this.graph.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return;

            const fromV = this.getVisualCoords(fromNode.x, fromNode.y);
            const toV = this.getVisualCoords(toNode.x, toNode.y);

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.classList.add('edge');
            g.dataset.from = edge.from;
            g.dataset.to = edge.to;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", fromV.vx);
            line.setAttribute("y1", fromV.vy);
            line.setAttribute("x2", toV.vx);
            line.setAttribute("y2", toV.vy);
            line.setAttribute("marker-end", "url(#arrowhead)");
            
            // Adjust for overlapping bidirectional edges visually (simple offset)
            const isBidirectional = this.graph.edges.some(e => e.from === edge.to && e.to === edge.from);
            if (isBidirectional) {
                const dx = toV.vx - fromV.vx;
                const dy = toV.vy - fromV.vy;
                const len = Math.sqrt(dx*dx + dy*dy);
                const nx = -dy / len * 5; // normal offset
                const ny = dx / len * 5;
                line.setAttribute("x1", fromV.vx + nx);
                line.setAttribute("y1", fromV.vy + ny);
                line.setAttribute("x2", toV.vx + nx);
                line.setAttribute("y2", toV.vy + ny);
            }

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            // Midpoint
            const mx = (fromV.vx + toV.vx) / 2;
            const my = (fromV.vy + toV.vy) / 2;
            text.setAttribute("x", mx);
            text.setAttribute("y", my - 8); // Slightly above line
            text.textContent = edge.cost;
            text.setAttribute("text-anchor", "middle");

            g.appendChild(line);
            g.appendChild(text);
            this.edgesLayer.appendChild(g);
        });

        // Draw nodes
        this.graph.nodes.forEach(node => {
            const { vx, vy } = this.getVisualCoords(node.x, node.y);
            
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.classList.add('node');
            if (this.graph.startNode === node.id) g.classList.add('start');
            if (this.graph.destNodes.includes(node.id)) g.classList.add('dest');
            if (selectedNodeId === node.id) g.classList.add('selected');
            g.dataset.id = node.id;
            g.setAttribute("transform", \`translate(\${vx}, \${vy})\`);

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("r", 15);
            
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = node.id;

            g.appendChild(circle);
            g.appendChild(text);
            this.nodesLayer.appendChild(g);
        });
    }
}
```

- [ ] **Step 2: Commit Rendering Engine**
```bash
git add src/renderer.js
git commit -m "feat: implement svg graph rendering engine"
```

### Task 6: Application State & Interactions

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Wire up state, renderer, and events**
Replace `src/app.js`:
```javascript
import { GraphState } from './graph.js';
import { Renderer, GRID_SIZE } from './renderer.js';
import { exportGraph, parseGraph } from './parser.js';

const graph = new GraphState();
const svg = document.getElementById('graph-svg');
const renderer = new Renderer(svg, graph);

let currentTool = 'addNode';
let selectedNodeForEdge = null;

// Tool Selection
document.querySelectorAll('input[name="tool"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentTool = e.target.value;
        selectedNodeForEdge = null;
        renderer.render();
    });
});

// Canvas Interactions
svg.addEventListener('click', (e) => {
    const target = e.target;
    
    // Find clicked node or edge
    const nodeGroup = target.closest('.node');
    const edgeGroup = target.closest('.edge');

    if (currentTool === 'addNode' && !nodeGroup && !edgeGroup) {
        // Get logical coords
        const rect = svg.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        
        const logicalX = Math.round(cx / GRID_SIZE);
        const logicalY = Math.round((rect.height - cy) / GRID_SIZE);
        
        graph.addNode(logicalX, logicalY);
        renderer.render();
    }
    
    else if (nodeGroup) {
        const id = parseInt(nodeGroup.dataset.id, 10);
        
        if (currentTool === 'remove') {
            graph.removeNode(id);
            renderer.render();
        } else if (currentTool === 'setStart') {
            graph.setStart(id);
            renderer.render();
        } else if (currentTool === 'setDest') {
            graph.toggleDest(id);
            renderer.render();
        } else if (currentTool === 'addEdge') {
            if (selectedNodeForEdge === null) {
                selectedNodeForEdge = id;
                renderer.render(selectedNodeForEdge);
            } else if (selectedNodeForEdge !== id) {
                const costStr = prompt("Enter edge cost:");
                if (costStr !== null && costStr.trim() !== '') {
                    const cost = parseFloat(costStr);
                    if (!isNaN(cost)) {
                        graph.addEdge(selectedNodeForEdge, id, cost);
                    }
                }
                selectedNodeForEdge = null;
                renderer.render();
            } else {
                selectedNodeForEdge = null; // click self to cancel
                renderer.render();
            }
        }
    }
    
    else if (edgeGroup) {
        if (currentTool === 'remove') {
            const from = parseInt(edgeGroup.dataset.from, 10);
            const to = parseInt(edgeGroup.dataset.to, 10);
            graph.removeEdge(from, to);
            renderer.render(selectedNodeForEdge);
        }
    }
});

// Handle window resize to adjust visual coords y-axis
window.addEventListener('resize', () => renderer.render(selectedNodeForEdge));

renderer.render();

// Export setup for the next task to hook into
window.appState = { graph, renderer, exportGraph, parseGraph };
```

- [ ] **Step 2: Commit App Interactions**
```bash
git add src/app.js
git commit -m "feat: implement canvas interactions and tools"
```

### Task 7: File I/O Integration

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Implement Import and Export logic**
Append to `src/app.js`:
```javascript
// File I/O
const btnImport = document.getElementById('btn-import');
const fileImport = document.getElementById('file-import');
const btnExport = document.getElementById('btn-export');

btnImport.addEventListener('click', () => fileImport.click());

fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const newGraph = window.appState.parseGraph(event.target.result);
            window.appState.graph.clear();
            Object.assign(window.appState.graph, newGraph);
            window.appState.renderer.render();
        } catch (err) {
            alert("Error parsing file format.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    fileImport.value = ''; // reset
});

btnExport.addEventListener('click', () => {
    if (window.appState.graph.nodes.length === 0) {
        alert("Graph is empty!");
        return;
    }
    const txt = window.appState.exportGraph(window.appState.graph);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
```

- [ ] **Step 2: Commit File I/O**
```bash
git add src/app.js
git commit -m "feat: integrate file import and export"
```
