import { GraphState } from './graph.js';
import { Renderer, GRID_SIZE } from './renderer.js';
import { exportGraph, parseGraph } from './parser.js';

const graph = new GraphState();
const svg = document.getElementById('graph-svg');
const renderer = new Renderer(svg, graph);

let currentTool = 'addNode';
let selectedNodeForEdge = null;

document.querySelectorAll('input[name="tool"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentTool = e.target.value;
        selectedNodeForEdge = null;
        renderer.render();
    });
});

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

window.addEventListener('resize', () => renderer.render(selectedNodeForEdge));

renderer.render();

window.appState = { graph, renderer, exportGraph, parseGraph };

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
    fileImport.value = '';
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