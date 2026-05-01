export const GRID_SIZE = 40;

export class Renderer {
    constructor(svgElement, graphState) {
        this.svg = svgElement;
        this.nodesLayer = svgElement.querySelector('#nodes-layer');
        this.edgesLayer = svgElement.querySelector('#edges-layer');
        this.graph = graphState;
        
        this.getVisualCoords = (x, y) => {
            const h = this.svg.clientHeight || window.innerHeight - 50;
            return {
                vx: x * GRID_SIZE,
                vy: h - (y * GRID_SIZE)
            };
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
            if (this.graph.destNodes.includes(node.id)) g.classList.add('dest');
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