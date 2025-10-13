// Sample tree data
const treeData = {
    name: "Root",
    children: [
        {
            name: "Branch 1",
            children: [
                { name: "Leaf 1.1" },
                {
                    name: "Leaf 1.2",
                    children: [
                        { name: "Leaf 1.2.1" },
                        { name: "Leaf 1.2.2" }
                    ]
                },
                { name: "Leaf 1.3" }
            ]
        },
        {
            name: "Branch 2",
            children: [
                { name: "Leaf 2.1" },
                { name: "Leaf 2.2" }
            ]
        },
        {
            name: "Branch 3",
            children: [
                {
                    name: "Leaf 3.1",
                    children: [
                        { name: "Leaf 3.1.1" },
                        { name: "Leaf 3.1.2" },
                        { name: "Leaf 3.1.3" }
                    ]
                },
                { name: "Leaf 3.2" }
            ]
        }
    ]
};

// Set up dimensions
const margin = { top: 20, right: 120, bottom: 20, left: 120 };
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
    }))
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const g = svg.append("g");

// Create tree layout
const tree = d3.tree().size([height, width]);

// Create hierarchy
const root = d3.hierarchy(treeData);
root.x0 = height / 2;
root.y0 = 0;

// Collapse all children initially
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

// Initialize with root expanded and first level collapsed
if (root.children) {
    root.children.forEach(collapse);
}

update(root);

// Update function
function update(source) {
    const duration = 750;

    // Compute the new tree layout
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Normalize for fixed-depth
    nodes.forEach(d => { d.y = d.depth * 180; });

    // Update nodes
    const node = g.selectAll("g.node")
        .data(nodes, d => d.id || (d.id = ++i));

    // Enter new nodes
    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff");

    nodeEnter.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children || d._children ? -13 : 13)
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.data.name)
        .style("fill-opacity", 1e-6);

    // Update existing nodes
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff")
        .attr("cursor", "pointer");

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Remove exiting nodes
    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update links
    const link = g.selectAll("path.link")
        .data(links, d => d.target.id);

    // Enter new links
    const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
        });

    // Update existing links
    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
        .duration(duration)
        .attr("d", d => diagonal(d.source, d.target));

    // Remove exiting links
    link.exit().transition()
        .duration(duration)
        .attr("d", d => {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o);
        })
        .remove();

    // Store old positions
    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Diagonal path generator
function diagonal(s, d) {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
}

// Toggle children on click
function click(event, d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

// Counter for node IDs
let i = 0;

// Button controls
document.getElementById("expandAll").addEventListener("click", () => {
    expandAll(root);
    update(root);
});

document.getElementById("collapseAll").addEventListener("click", () => {
    root.children.forEach(collapse);
    update(root);
});

document.getElementById("resetZoom").addEventListener("click", () => {
    d3.select("#tree-container svg")
        .transition()
        .duration(750)
        .call(d3.zoom().transform, d3.zoomIdentity.translate(margin.left, margin.top));
});

function expandAll(d) {
    if (d._children) {
        d.children = d._children;
        d._children = null;
    }
    if (d.children) {
        d.children.forEach(expandAll);
    }
}
