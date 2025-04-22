

# Dijkstra’s Algorithm Simulation

## Table of Contents

1. Introduction
2. Features
3. How Dijkstra’s Algorithm Works
4. Project Structure
5. Installation & Setup
6. Usage Guide
7. Customization
8. Screenshots
9. Credits
10. License

---

## Introduction

This project is an interactive visualization of **Dijkstra’s Algorithm** for finding the shortest path in a weighted graph. Built with React and Vite, it allows users to create custom graphs, set edge weights, and watch the algorithm in action step-by-step.

---

## Features

- **Interactive Graph Creation:** Add nodes and edges manually or generate random graphs.
- **Edge Weight Assignment:** Assign custom weights to edges.
- **Source Node Selection:** Choose any node as the starting point.
- **Step-by-Step Visualization:** Watch the algorithm progress in real time.
- **Adjustable Animation Speed:** Control the speed of the simulation.
- **Result Display:** View shortest paths and distances from the source to all nodes.
- **Responsive UI:** Works on desktop and mobile screens.

---

## How Dijkstra’s Algorithm Works

Dijkstra’s Algorithm finds the shortest path from a source node to all other nodes in a weighted, undirected graph with non-negative edge weights.

**Steps:**
1. Set the distance to the source node as 0 and all others as infinity.
2. Mark all nodes as unvisited. Set the source as the current node.
3. For the current node, consider all unvisited neighbors and calculate their tentative distances through the current node.
4. Once all neighbors are considered, mark the current node as visited.
5. Select the unvisited node with the smallest tentative distance as the new current node.
6. Repeat steps 3–5 until all nodes are visited or the smallest tentative distance among unvisited nodes is infinity.

---

## Project Structure

```
djsimulation/
├── src/
│   ├── App.jsx          # Main React component
│   ├── assets/
│   │   └── simulation.jsx
│   ├── index.css        # Global styles
│   └── App.css          # App-specific styles
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd Dijkstras-Algorithm-Simulation - Main/djsimulation
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```

4. **Open in your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Usage Guide

1. **Set Number of Nodes:** Use the input to choose how many nodes you want (2–15).
2. **Create Edges:**
   - Click "Add Edge", then click two nodes to connect them.
   - Enter the edge weight and click "Add".
   - Or, click "Generate Random Graph" for a random setup.
3. **Select Source Node:** Click any node to set it as the source (highlighted).
4. **Run Algorithm:** Click "Run Dijkstra's Algorithm" to start the visualization.
5. **Control Animation:** Adjust the speed slider as desired.
6. **View Results:** After completion, shortest paths and distances are shown.

---

## Customization

- **Styling:** Modify App.css for custom colors and layout.
- **Algorithm Logic:** The main logic is in `src/App.jsx`. You can tweak the algorithm or visualization as needed.
- **Edge/Node Limits:** Change the min/max values in the node input for different graph sizes.

---

## Credits

Made with ❤️ by Ritwik, Shashank, and Vedant.

---

## License

This project is open source and available under the MIT License.

---

Feel free to expand or modify this template to suit your needs!