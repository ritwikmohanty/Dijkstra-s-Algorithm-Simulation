import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [numNodes, setNumNodes] = useState(5);

  const [source, setSource] = useState(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [currentEdge, setCurrentEdge] = useState({ source: null, target: null });
  const [currentWeight, setCurrentWeight] = useState(1);
  const [visitedOrder, setVisitedOrder] = useState([]);
  const [distances, setDistances] = useState([]);
  const [path, setPath] = useState([]);
  const [step, setStep] = useState(0);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmState, setAlgorithmState] = useState('idle');
  const canvasRef = useRef(null);

  // Initialize graph
  useEffect(() => {
    resetGraph();
  }, [numNodes]);

  const resetGraph = () => {
    setAlgorithmState('idle');
    setIsRunning(false);
    setStep(0);
    setVisitedOrder([]);
    setPath([]);
    setDistances([]);
    
    // Create nodes in a circular layout
    const newNodes = [];
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2.5 };
    
    for (let i = 0; i < numNodes; i++) {
      const angle = (i * 2 * Math.PI) / numNodes;
      newNodes.push({
        id: i,
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
        label: String.fromCharCode(65 + i), // A, B, C, etc.
      });
    }
    
    setNodes(newNodes);
    setEdges([]);
  };

  const restartSimulation = () => {
    setAlgorithmState('idle');
    setIsRunning(false);
    setStep(0);
    setVisitedOrder([]);
    setDistances([]);
    setPath([]);
  };

  // Generate random graph
  const generateRandomGraph = () => {
    const newEdges = [];
    const density = 0.4; // Control the density of edges
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < density) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newEdges.push({ source: i, target: j, weight });
        }
      }
    }
    
    setEdges(newEdges);
  };

  // Handle node click
  const handleNodeClick = (nodeId) => {
    if (isCreatingEdge) {
      if (currentEdge.source === null) {
        setCurrentEdge({ ...currentEdge, source: nodeId });
      } else if (currentEdge.source !== nodeId) {
        setShowWeightInput(true);
        setCurrentEdge({ ...currentEdge, target: nodeId });
      }
    } else if (!isRunning) {
      setSource(nodeId);
    }
  };

  // Add edge with weight
  const addEdge = () => {
    if (currentEdge.source !== null && currentEdge.target !== null) {
      // Check if edge already exists
      const edgeExists = edges.some(
        (edge) => 
          (edge.source === currentEdge.source && edge.target === currentEdge.target) ||
          (edge.source === currentEdge.target && edge.target === currentEdge.source)
      );
      
      if (!edgeExists) {
        setEdges([...edges, { ...currentEdge, weight: currentWeight }]);
      }
      
      setCurrentEdge({ source: null, target: null });
      setCurrentWeight(1);
      setShowWeightInput(false);
    }
  };

  // Run Dijkstra's algorithm
  const runDijkstra = () => {
    setIsRunning(true);
    setAlgorithmState('running');
    
    // Initialize distances
    const dist = Array(nodes.length).fill(Infinity);
    dist[source] = 0;
    
    // Initialize visited nodes
    const visited = Array(nodes.length).fill(false);
    
    // Initialize previous nodes for path reconstruction
    const prev = Array(nodes.length).fill(null);
    
    // Create adjacency list
    const adjacencyList = Array(nodes.length).fill().map(() => []);
    edges.forEach(edge => {
      adjacencyList[edge.source].push({ node: edge.target, weight: edge.weight });
      adjacencyList[edge.target].push({ node: edge.source, weight: edge.weight });
    });
    
    // Visualization data
    const visitOrder = [];
    const distanceStates = [{ ...dist }];
    
    // Dijkstra's algorithm
    for (let i = 0; i < nodes.length; i++) {
      // Find the unvisited node with the smallest distance
      let minDist = Infinity;
      let minNode = -1;
      
      for (let j = 0; j < nodes.length; j++) {
        if (!visited[j] && dist[j] < minDist) {
          minDist = dist[j];
          minNode = j;
        }
      }
      
      // No reachable unvisited nodes
      if (minNode === -1) break;
      
      // Mark node as visited
      visited[minNode] = true;
      visitOrder.push(minNode);
      
      // Update distances to neighbors
      for (const { node: neighbor, weight } of adjacencyList[minNode]) {
        if (!visited[neighbor]) {
          const newDist = dist[minNode] + weight;
          if (newDist < dist[neighbor]) {
            dist[neighbor] = newDist;
            prev[neighbor] = minNode;
            // Save the state after each update
            distanceStates.push({ ...dist });
          }
        }
      }
    }
    
    // After the Dijkstra's algorithm loop
    setVisitedOrder(visitOrder);
    setDistances([...distanceStates]); // Ensure the final state is updated
    
    // Start animation
    setStep(0);
    
    // Calculate final paths
    const paths = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i === source) continue;
      
      const path = [];
      let current = i;
      
      while (current !== null) {
        path.unshift(current);
        current = prev[current];
      }
      
      if (path.length > 0 && path[0] === source) {
        paths.push({ target: i, path });
      }
    }
    
    setPath(paths);
  };

  // Step through the algorithm animation
  useEffect(() => {
    if (isRunning && step <= visitedOrder.length) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, animationSpeed);

      return () => clearTimeout(timer);
    } else if (isRunning && step > visitedOrder.length) {
      setAlgorithmState('completed');
    }
  }, [isRunning, step, visitedOrder.length, animationSpeed]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 180;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    edges.forEach((edge, index) => {
      const sourceNode = nodes[edge.source];
      const targetNode = nodes[edge.target];
      
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      
      // Highlight path edges
      const isInPath = algorithmState === 'completed' && path.some(p => {
        for (let i = 0; i < p.path.length - 1; i++) {
          if (
            (p.path[i] === edge.source && p.path[i + 1] === edge.target) ||
            (p.path[i] === edge.target && p.path[i + 1] === edge.source)
          ) {
            return true;
          }
        }
        return false;
      });
      
      if (isInPath) {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
      }
      
      ctx.stroke();
      
      // Draw weight with offset for overlapping edges
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;
      
      // Offset weights for overlapping edges
      const offset = index % 2 === 0 ? 10 : -10; // Alternate offsets
      const offsetX = (targetNode.y - sourceNode.y) / Math.sqrt((targetNode.x - sourceNode.x) ** 2 + (targetNode.y - sourceNode.y) ** 2) * offset;
      const offsetY = (sourceNode.x - targetNode.x) / Math.sqrt((targetNode.x - sourceNode.x) ** 2 + (targetNode.y - sourceNode.y) ** 2) * offset;
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(midX + offsetX, midY + offsetY, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#e74c3c';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.weight, midX + offsetX, midY + offsetY);
    });
    
    // Draw current edge being created
    if (isCreatingEdge && currentEdge.source !== null) {
      const sourceNode = nodes[currentEdge.source];
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      
      if (currentEdge.target === null) {
        // Draw line to mouse position (not implemented here)
        ctx.lineTo(sourceNode.x + 100, sourceNode.y + 100);
      } else {
        const targetNode = nodes[currentEdge.target];
        ctx.lineTo(targetNode.x, targetNode.y);
      }
      
      ctx.strokeStyle = '#3498db';
      ctx.setLineDash([5, 3]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw nodes
    nodes.forEach((node, index) => {
      ctx.beginPath();
      
      // Node appearance based on state
      let nodeColor = '#3498db'; // Default color
      let textColor = '#fff';
      let nodeSize = 25;
      
      if (index === source) {
        nodeColor = '#2ecc71'; // Source node
        nodeSize = 30;
      } else if (algorithmState === 'running' || algorithmState === 'completed') {
        if (visitedOrder.slice(0, step).includes(index)) {
          nodeColor = '#e74c3c'; // Visited node
        }
      }
      
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      
      // Draw node label
      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      
      // Draw distance if algorithm is running or completed
      if ((algorithmState === 'running' || algorithmState === 'completed') && 
          distances.length > 0) {
        const currentDist = distances[Math.min(step, distances.length - 1)][index];
        const distText = currentDist === Infinity ? '∞' : currentDist;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(node.x, node.y - nodeSize - 10, 15, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText(distText, node.x, node.y - nodeSize - 10);
      }
    });
    
  }, [nodes, edges, source, isCreatingEdge, currentEdge, step, visitedOrder, distances, path, algorithmState]);

  return (
    <div className="container">
      <h1 className="title">Dijkstra's Algorithm Visualization</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Nodes:</label>
          <input
            type="number"
            min="2"
            max="15"
            value={numNodes}
            onChange={(e) => setNumNodes(parseInt(e.target.value))}
            className="node-input"
          />
        </div>
        
        <button
          onClick={resetGraph}
          className="button reset-button"
        >
          Reset Graph
        </button>
        
        <button
          onClick={generateRandomGraph}
          className="button generate-button"
        >
          Generate Random Graph
        </button>
        
        <button
          onClick={() => setIsCreatingEdge(!isCreatingEdge)}
          className={`button ${isCreatingEdge ? 'cancel-button' : 'add-edge-button'}`}
        >
          {isCreatingEdge ? 'Cancel Edge Creation' : 'Add Edge'}
        </button>
        
        <button
          onClick={runDijkstra}
          disabled={isRunning || edges.length === 0}
          className={`button run-button ${isRunning || edges.length === 0 ? 'disabled' : ''}`}
        >
          Run Dijkstra's Algorithm
        </button>
        
        <button
          onClick={restartSimulation}
          className="button reset-button"
        >
          Restart Simulation
        </button>
        
        <div className="control-group">
          <label>Speed:</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={2100 - animationSpeed}
            onChange={(e) => setAnimationSpeed(2100 - parseInt(e.target.value))}
            className="speed-slider"
          />
        </div>
      </div>
      
      {showWeightInput && (
        <div className="weight-input-container">
          <span>Edge Weight:</span>
          <input
            type="number"
            min="1"
            max="99"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(parseInt(e.target.value))}
            className="weight-input"
          />
          <button
            onClick={addEdge}
            className="button add-button"
          >
            Add
          </button>
        </div>
      )}
      
      <div className="status-container">
        <div className="status-info">
          <div>
            <span>Source Node: {nodes[source]?.label || ''}</span>
          </div>
          <div>
            <span>
              {algorithmState === 'idle' && 'Click on a node to set as source. Create edges or generate random graph.'}
              {algorithmState === 'running' && `Step ${step}/${visitedOrder.length}`}
              {algorithmState === 'completed' && 'Algorithm completed!'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color source-color"></div>
          <span>Source Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color visited-color"></div>
          <span>Visited Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color path-color"></div>
          <span>Shortest Path</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="canvas"
        onClick={(e) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Find clicked node
          const clickedNode = nodes.findIndex(node => 
            Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 25
          );
          
          if (clickedNode !== -1) {
            handleNodeClick(clickedNode);
          }
        }}
      />
      
      {algorithmState === 'completed' && (
        <div className="results-container">
          <h3 className="results-title">Results</h3>
          <div className="results-grid">
            {path.map((p) => (
              <div key={p.target} className="result-item">
                <div className="path-title">
                  Path from {nodes[source]?.label} to {nodes[p.target]?.label}:
                </div>
                <div className="path-nodes">
                  {p.path.map((node) => nodes[node]?.label).join(' → ')}
                </div>
                <div className="path-distance">
                  Distance: {distances[distances.length - 1][p.target]}
                </div>
              </div>
            ))}
          </div>
          <div className='credits'>
            Made with Love by Ritwik, Shashank and Vedant ❤️
          </div>
        </div>
        
      )}
    </div>
  );
}

export default App;