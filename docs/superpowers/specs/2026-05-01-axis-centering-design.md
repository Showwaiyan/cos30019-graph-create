# Graph Centering & Axis Visualization Feature

## Overview
Improve the user experience when creating and importing graphs by:
1. Adding visible X/Y axis indicators at the origin (0,0) for manual node creation
2. Auto-centering the graph when importing from a TXT file

## Design

### Section 1: Axis Visualization (for manual creation)
- Add permanent X-axis line at y=0 and Y-axis line at x=0 on the SVG canvas
- Label them "X" and "Y" with "0" at the intersection (bottom-left corner)
- This helps users understand the coordinate system as they click to add nodes
- Visual styling: dashed gray lines for axis, small text labels

### Section 2: Auto-center on Import
- When importing a TXT file:
  1. Calculate bounding box: minX, maxX, minY, maxY from all nodes
  2. Calculate graph center: (minX + maxX)/2, (minY + maxY)/2
  3. Calculate viewport center based on current SVG dimensions
  4. Apply offset to all nodes: newX = oldX + (viewportCenterX - graphCenterX)
  5. Store the offset so subsequent manual node additions appear in the centered area
- The offset persists until the graph is cleared or the page is refreshed

## Implementation Notes
- The axis lines are static SVG elements drawn behind the nodes layer
- The centering calculation happens in the `parseGraph` function or right after parsing
- The offset is stored in the Renderer class and applied in `getVisualCoords`