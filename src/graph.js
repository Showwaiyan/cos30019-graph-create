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
