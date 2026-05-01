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
        const expected = `1 // Starting node
2 // Destination nodes
1:(1,4)
2:(4,10)
1,2,9 // list of edges`;
        
        expect(output.trim()).toBe(expected.trim());
    });
});
