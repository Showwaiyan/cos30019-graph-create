# Graph Creator Web App Design Spec

## Overview
A web-based tool for creating, visualizing, and modifying graphs used in pathfinding algorithms (DFS, BFS, A*, etc.). The application allows users to draw nodes and edges on a grid, set start and destination points, and export/import the graph data using a specific text file format (`Map1.txt` format).

## Architecture & Tech Stack
*   **Core Tech:** Vanilla HTML, CSS, JavaScript. No build tools or frameworks required.
*   **Renderer:** `<svg>` element for drawing the graph. SVG provides native click events for nodes and edges, making interactive tools easier to implement than a raw `<canvas>`.
*   **File Structure:**
    *   `index.html`: UI structure (toolbar and SVG container).
    *   `style.css`: Visual styling, grid background pattern, colors, and layout.
    *   `app.js`: Graph state, interaction logic, rendering engine, and file parsing/exporting.

## Data Model
The central state of the application will be a JavaScript object:
*   `nodes`: Array of objects `{ id: number, x: number, y: number }`. Coordinates are strictly integers on a grid.
*   `edges`: Array of objects `{ from: number, to: number, cost: number }`. Edges are strictly unidirectional (directed). A bidirectional connection requires two distinct edges in the data model.
*   `startNode`: `number` (The ID of the starting node).
*   `destNodes`: Array of `number` (The IDs of the destination nodes).

## UI & Interactions

### Layout
*   **Top Toolbar:** Contains the tool selection (radio-button style) and action buttons.
*   **Canvas:** A large, scrollable/pannable (optional) SVG area with a visual grid. The origin `(0,0)` is at the bottom-left corner of the logical grid.

### Tools (Selectable modes)
1.  **Add Node:** Clicking an empty spot on the grid snaps to the nearest integer coordinates and creates a new node, auto-assigning the next available integer ID.
2.  **Add Edge:** Click a source node (A), then a target node (B). The app prompts for the edge's cost. This creates a directed edge `A -> B`. To create `B -> A`, the user must explicitly click B then A.
3.  **Set Start:** Clicking a node designates it as the singular `startNode`. Visually distinguished (e.g., green).
4.  **Set Dest:** Clicking a node toggles its presence in the `destNodes` list. Visually distinguished (e.g., red).
5.  **Remove:** Clicking a node deletes it (and all connected edges). Clicking an edge deletes it.

### File I/O Actions
*   **Import TXT:** Opens a file dialog. Parses the selected file, updating the application state and re-rendering the SVG.
*   **Export TXT:** Generates a text file matching the `Map1.txt` format and triggers a download.

## File Format Specification (`Map1.txt` format)
The application must accurately parse and generate this exact format:
*   **Line 1:** `[Start Node ID] // Starting node...`
*   **Line 2:** `[Dest Node ID 1];[Dest Node ID 2]... // Destination nodes...`
*   **Node Lines:** `[Node ID]:([X],[Y]) // Node [ID] at ([X],[Y])`
*   **Edge List Marker:** `[ID1],[ID2],[Cost] // list of edges` (First edge usually contains the comment)
*   **Edge Lines:** `[From ID],[To ID],[Cost]`

**Parser Rules:**
*   Lines are parsed sequentially.
*   Comments (everything after and including `//`) are ignored during parsing.
*   The first line defines the start node.
*   The second line defines destination nodes (separated by semicolons).
*   Lines containing a colon (`:`) define nodes and their `(x,y)` coordinates.
*   Lines containing commas (`,`) define directed edges and their cost.

## Coordinate System
*   The UI grid represents an abstract integer grid.
*   The logical origin `(0,0)` is mapped to the bottom-left of the visual canvas. 
*   Clicking on the screen translates browser client coordinates (where top-left is 0,0) to logical graph coordinates (where bottom-left is 0,0) before saving or exporting.
