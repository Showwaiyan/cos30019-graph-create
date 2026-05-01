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
