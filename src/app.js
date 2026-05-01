const GRID_SIZE = 40;

class GraphState {
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

class Renderer {
    constructor(svgElement, graphState) {
        this.svg = svgElement;
        this.nodesLayer = svgElement.querySelector('#nodes-layer');
        this.edgesLayer = svgElement.querySelector('#edges-layer');
        this.graph = graphState;
    }

    getVisualCoords(x, y) {
        const h = this.svg.clientHeight || 500;
        return {
            vx: x * GRID_SIZE,
            vy: h - (y * GRID_SIZE)
        };
    }

    render(selectedNodeId = null) {
        this.nodesLayer.innerHTML = '';
        this.edgesLayer.innerHTML = '';

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

            const isBidirectional = this.graph.edges.some(e => e.from === edge.to && e.to === edge.from);
            if (isBidirectional) {
                const dx = toV.vx - fromV.vx;
                const dy = toV.vy - fromV.vy;
                const len = Math.sqrt(dx*dx + dy*dy);
                const nx = -dy / len * 5;
                const ny = dx / len * 5;
                line.setAttribute("x1", fromV.vx + nx);
                line.setAttribute("y1", fromV.vy + ny);
                line.setAttribute("x2", toV.vx + nx);
                line.setAttribute("y2", toV.vy + ny);
            }

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const mx = (fromV.vx + toV.vx) / 2;
            const my = (fromV.vy + toV.vy) / 2;
            text.setAttribute("x", mx);
            text.setAttribute("y", my - 8);
            text.textContent = edge.cost;
            text.setAttribute("text-anchor", "middle");

            g.appendChild(line);
            g.appendChild(text);
            this.edgesLayer.appendChild(g);
        });

        this.graph.nodes.forEach(node => {
            const { vx, vy } = this.getVisualCoords(node.x, node.y);

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.classList.add('node');
            if (this.graph.startNode === node.id) g.classList.add('start');
            if (this.graph.destNodes.includes(node.id) && this.graph.destNodes.length > 0) g.classList.add('dest');
            if (selectedNodeId === node.id) g.classList.add('selected');
            g.dataset.id = node.id;
            g.setAttribute("transform", `translate(${vx}, ${vy})`);

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

function parseGraph(text) {
    const graph = new GraphState();
    const lines = text.split('\n');
    let lineIdx = 0;

    const strip = (str) => str.split('//')[0].trim();

    // Skip empty lines at start
    while (lineIdx < lines.length && !strip(lines[lineIdx])) lineIdx++;
    if (lineIdx < lines.length) {
        graph.setStart(parseInt(strip(lines[lineIdx]), 10));
        lineIdx++;
    }

    while (lineIdx < lines.length && !strip(lines[lineIdx])) lineIdx++;
    if (lineIdx < lines.length) {
        const destStr = strip(lines[lineIdx]);
        if (destStr) {
            destStr.split(';').forEach(d => {
                const val = parseInt(d, 10);
                if (!isNaN(val)) graph.toggleDest(val);
            });
        }
        lineIdx++;
    }

    let maxId = 0;

    for (; lineIdx < lines.length; lineIdx++) {
        const line = strip(lines[lineIdx]);
        if (!line) continue;

        if (line.includes(':')) {
            const [idPart, coordPart] = line.split(':');
            const id = parseInt(idPart, 10);
            const coords = coordPart.replace(/[()]/g, '').split(',');
            const x = parseInt(coords[0], 10);
            const y = parseInt(coords[1], 10);

            if (!isNaN(id) && !isNaN(x) && !isNaN(y)) {
                graph.nodes.push({ id, x, y });
                if (id > maxId) maxId = id;
            }
        } else if (line.includes(',')) {
            const parts = line.split(',').map(n => parseInt(n, 10));
            if (parts.length >= 3 && !parts.some(isNaN)) {
                graph.addEdge(parts[0], parts[1], parts[2]);
            }
        }
    }

    graph.nextNodeId = maxId + 1;
    return graph;
}

function exportGraph(graph) {
    let out = [];

    out.push(`${graph.startNode ?? ''} // Starting node`);

    out.push(`${graph.destNodes.join(';')} // Destination nodes`);

    graph.nodes.forEach(n => {
        out.push(`${n.id}:(${n.x},${n.y})`);
    });

    graph.edges.forEach((e, idx) => {
        let suffix = idx === 0 ? ' // list of edges' : '';
        out.push(`${e.from},${e.to},${e.cost}${suffix}`);
    });

    return out.join('\n');
}

// Initialize
const graph = new GraphState();
const svg = document.getElementById('graph-svg');
const renderer = new Renderer(svg, graph);

let currentTool = 'addNode';
let selectedNodeForEdge = null;

// Tool selection
document.querySelectorAll('input[name="tool"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentTool = e.target.value;
        selectedNodeForEdge = null;
        renderer.render();
    });
});

// Canvas click
svg.addEventListener('click', (e) => {
    const target = e.target;
    const nodeGroup = target.closest('.node');
    const edgeGroup = target.closest('.edge');

    if (currentTool === 'addNode' && !nodeGroup && !edgeGroup) {
        const rect = svg.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const logicalX = Math.round(cx / GRID_SIZE);
        const logicalY = Math.round((rect.height - cy) / GRID_SIZE);

        console.log('Adding node at', logicalX, logicalY);
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
                selectedNodeForEdge = null;
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

// Resize handler
window.addEventListener('resize', () => renderer.render(selectedNodeForEdge));

// Initial render after a short delay
setTimeout(() => renderer.render(), 100);

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
            const newGraph = parseGraph(event.target.result);
            graph.nodes = newGraph.nodes;
            graph.edges = newGraph.edges;
            graph.startNode = newGraph.startNode;
            graph.destNodes = newGraph.destNodes;
            graph.nextNodeId = newGraph.nextNodeId;
            renderer.render();
            alert('Graph imported successfully!');
        } catch (err) {
            alert("Error parsing file format: " + err.message);
            console.error(err);
        }
    };
    reader.readAsText(file);
    fileImport.value = '';
});

btnExport.addEventListener('click', () => {
    if (graph.nodes.length === 0) {
        alert("Graph is empty!");
        return;
    }
    const txt = exportGraph(graph);
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