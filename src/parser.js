import { GraphState } from './graph.js';

export function parseGraph(text) {
    const graph = new GraphState();
    const lines = text.split('\n');

    // Helper to strip comments
    const strip = (str) => str.split('//')[0].trim();

    // 1st line: Start Node
    if (lines.length > 0) {
        const startStr = strip(lines[0]);
        if (startStr) {
            const startId = parseInt(startStr, 10);
            if (!isNaN(startId)) graph.setStart(startId);
        }
    }

    // 2nd line: Destination Nodes
    if (lines.length > 1) {
        const destStr = strip(lines[1]);
        if (destStr) {
            destStr.split(';').forEach(d => {
                const destId = parseInt(d, 10);
                if (!isNaN(destId)) graph.toggleDest(destId);
            });
        }
    }

    let maxId = 0;

    // Parse Nodes and Edges
    for (let lineIdx = 2; lineIdx < lines.length; lineIdx++) {
        const line = strip(lines[lineIdx]);
        if (!line) continue;

        if (line.includes(':')) {
            // Node line: ID:(X,Y)
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
            // Edge line: From,To,Cost
            const [from, to, cost] = line.split(',').map(n => parseInt(n, 10));
            if (!isNaN(from) && !isNaN(to) && !isNaN(cost)) {
                graph.addEdge(from, to, cost);
            }
        }
    }
    
    graph.nextNodeId = maxId + 1;
    return graph;
}

export function exportGraph(graph) {
    let out = [];
    
    // Start node
    out.push(`${graph.startNode ?? ''} // Starting node`);
    
    // Dest nodes
    out.push(`${graph.destNodes.join(';')} // Destination nodes`);
    
    // Nodes
    graph.nodes.forEach(n => {
        out.push(`${n.id}:(${n.x},${n.y})`);
    });
    
    // Edges
    graph.edges.forEach((e, idx) => {
        let suffix = idx === 0 ? ' // list of edges' : '';
        out.push(`${e.from},${e.to},${e.cost}${suffix}`);
    });

    return out.join('\n');
}
