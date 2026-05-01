# Axis Visualization & Auto-Center Implementation Plan

**Goal:** Add visible X/Y axis for manual node creation and auto-center graph when importing from TXT file.

**Architecture:** Modify the existing Renderer class to handle axis rendering and centering offset.

---

### Task: Implement Axis Visualization & Auto-Center

**Files:**
- Modify: `src/app.js` (add axis rendering and centering logic)
- Modify: `index.html` (add axis layer in SVG)

- [ ] **Step 1: Add axis layer to SVG**
In `index.html`, add a new `<g id="axis-layer">` layer before the edges and nodes layers:
```html
<g id="axis-layer"></g>
<g id="edges-layer"></g>
<g id="nodes-layer"></g>
```

- [ ] **Step 2: Update Renderer to support axis and centering**
In `src/app.js`, update the Renderer class:

```javascript
class Renderer {
    constructor(svgElement, graphState) {
        this.svg = svgElement;
        this.nodesLayer = svgElement.querySelector('#nodes-layer');
        this.edgesLayer = svgElement.querySelector('#edges-layer');
        this.axisLayer = svgElement.querySelector('#axis-layer');
        this.graph = graphState;
        this.centerOffset = { x: 0, y: 0 }; // Offset for centering
    }

    getVisualCoords(x, y) {
        const h = this.svg.clientHeight || 500;
        const w = this.svg.clientWidth || 800;
        // Apply centering offset
        const graphCenterX = (x + this.centerOffset.x) * GRID_SIZE;
        const graphCenterY = (y + this.centerOffset.y) * GRID_SIZE;
        return {
            vx: graphCenterX,
            vy: h - graphCenterY
        };
    }

    renderAxes() {
        const h = this.svg.clientHeight || 500;
        const w = this.svg.clientWidth || 800;
        
        this.axisLayer.innerHTML = '';
        
        // Y-axis line (vertical at x=0)
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", 0);
        yAxis.setAttribute("y1", h);
        yAxis.setAttribute("x2", 0);
        yAxis.setAttribute("y2", 0);
        yAxis.setAttribute("stroke", "#999");
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke-dasharray", "5,5");
        this.axisLayer.appendChild(yAxis);
        
        // X-axis line (horizontal at y=0)
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", 0);
        xAxis.setAttribute("y1", h);
        xAxis.setAttribute("x2", w);
        xAxis.setAttribute("y2", h);
        xAxis.setAttribute("stroke", "#999");
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke-dasharray", "5,5");
        this.axisLayer.appendChild(xAxis);
        
        // Origin label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", 10);
        label.setAttribute("y", h - 10);
        label.setAttribute("fill", "#666");
        label.setAttribute("font-size", "12");
        label.textContent = "0";
        this.axisLayer.appendChild(label);
    }

    centerGraph() {
        if (this.graph.nodes.length === 0) return;
        
        const minX = Math.min(...this.graph.nodes.map(n => n.x));
        const maxX = Math.max(...this.graph.nodes.map(n => n.x));
        const minY = Math.min(...this.graph.nodes.map(n => n.y));
        const maxY = Math.max(...this.graph.nodes.map(n => n.y));
        
        const graphCenterX = (minX + maxX) / 2;
        const graphCenterY = (minY + maxY) / 2;
        
        const h = this.svg.clientHeight || 500;
        const w = this.svg.clientWidth || 800;
        
        // Calculate how many grid units from origin to center
        const viewportCenterX = w / 2 / GRID_SIZE;
        const viewportCenterY = h / 2 / GRID_SIZE;
        
        this.centerOffset.x = viewportCenterX - graphCenterX;
        this.centerOffset.y = viewportCenterY - graphCenterY;
    }

    render(selectedNodeId = null) {
        this.renderAxes(); // Draw axes
        
        // ... existing edge and node rendering code ...
        // ... but use getVisualCoords which now applies offset ...
    }
}
```

- [ ] **Step 3: Call centerGraph after importing**
In the file import handler, after parsing:
```javascript
const newGraph = parseGraph(event.target.result);
graph.nodes = newGraph.nodes;
graph.edges = newGraph.edges;
graph.startNode = newGraph.startNode;
graph.destNodes = newGraph.destNodes;
graph.nextNodeId = newGraph.nextNodeId;
renderer.centerGraph(); // Auto-center on import
renderer.render();
```

- [ ] **Step 4: Test**
- Verify axes appear at bottom-left (origin 0,0)
- Import a graph file and verify it centers in the viewport

- [ ] **Step 5: Commit**
```bash
git add index.html src/app.js
git commit -m "feat: add axis visualization and auto-center on import"
```