# D3 Tree Visualization

A dynamic, interactive tree visualization built with D3.js. This project creates collapsible tree diagrams with smooth animations and zoom/pan capabilities.

## Features

- **Interactive Nodes**: Click on nodes to expand or collapse their children
- **Smooth Animations**: Elegant transitions when expanding/collapsing branches
- **Zoom & Pan**: Navigate large trees with mouse wheel zoom and drag-to-pan
- **Control Buttons**:
  - Expand All: Opens all tree branches
  - Collapse All: Closes all branches except root
  - Reset Zoom: Returns view to original position
- **Responsive Design**: Adapts to different screen sizes

## Files

- `index.html` - Main HTML structure
- `tree.js` - D3.js tree visualization logic
- `styles.css` - Styling and layout
- `requirements.txt` - Project specification

## Usage

1. Open `index.html` in a web browser
2. Click on nodes to expand/collapse branches
3. Use mouse wheel to zoom in/out
4. Click and drag to pan around the tree
5. Use control buttons for bulk operations

## Customizing the Tree Data

Edit the `treeData` object in `tree.js` to change the tree structure:

```javascript
const treeData = {
    name: "Your Root Node",
    children: [
        {
            name: "Child 1",
            children: [
                { name: "Grandchild 1.1" },
                { name: "Grandchild 1.2" }
            ]
        },
        {
            name: "Child 2",
            children: [
                { name: "Grandchild 2.1" }
            ]
        }
    ]
};
```

## Configuration Options

In `tree.js`, you can adjust:

- **Dimensions**: Modify `width` and `height` variables
- **Node Spacing**: Change `d.y = d.depth * 180` (180 is the spacing between levels)
- **Animation Speed**: Adjust `duration` (in milliseconds)
- **Node Size**: Modify circle radius in `.attr("r", 10)`
- **Colors**: Change node and link colors in the CSS or inline styles

## Browser Compatibility

Works in all modern browsers that support:
- D3.js v7
- SVG
- ES6 JavaScript

## Dependencies

- D3.js v7 (loaded via CDN)

No installation required - just open `index.html` in a browser!

## License

Free to use and modify for any purpose.
