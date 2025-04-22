import React, { useState, useEffect, useRef } from 'react';

const simulation = () => {
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
    
    // Store the results
    setVisitedOrder(visitOrder);
    setDistances(distanceStates);
    
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
    if (isRunning && step < visitedOrder.length) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, animationSpeed);
      
      return () => clearTimeout(timer);
    } else if (isRunning && step >= visitedOrder.length) {
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
      
      // Draw distance if algorithm is running
      if ((algorithmState === 'running' || algorithmState === 'completed') && 
          distances.length > 0 && step > 0) {
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
    <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">Dijkstra's Algorithm Visualization</h1>
      
      <div className="flex items-center gap-4 mb-4 flex-wrap justify-center">
        <div className="flex items-center">
          <label className="mr-2">Nodes:</label>
          <input
            type="number"
            min="2"
            max="15"
            value={numNodes}
            onChange={(e) => setNumNodes(parseInt(e.target.value))}
            className="bg-gray-800 p-2 rounded w-16 text-white"
          />
        </div>
        
        <button
          onClick={resetGraph}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          Reset Graph
        </button>
        
        <button
          onClick={generateRandomGraph}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          Generate Random Graph
        </button>
        
        <button
          onClick={() => setIsCreatingEdge(!isCreatingEdge)}
          className={`px-4 py-2 rounded ${
            isCreatingEdge ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          {isCreatingEdge ? 'Cancel Edge Creation' : 'Add Edge'}
        </button>
        
        <button
          onClick={runDijkstra}
          disabled={isRunning || edges.length === 0}
          className={`px-4 py-2 rounded ${
            isRunning || edges.length === 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          Run Dijkstra's Algorithm
        </button>
        
        <div className="flex items-center">
          <label className="mr-2">Speed:</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={2100 - animationSpeed}
            onChange={(e) => setAnimationSpeed(2100 - parseInt(e.target.value))}
            className="w-32"
          />
        </div>
      </div>
      
      {showWeightInput && (
        <div className="bg-gray-800 p-4 rounded mb-4 flex items-center gap-2">
          <span>Edge Weight:</span>
          <input
            type="number"
            min="1"
            max="99"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(parseInt(e.target.value))}
            className="bg-gray-700 p-2 rounded w-16 text-white"
          />
          <button
            onClick={addEdge}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      )}
      
      <div className="bg-gray-800 p-2 rounded mb-4 w-full max-w-2xl">
        <div className="flex justify-between items-center">
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
      
      <div className="legend flex gap-6 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span>Source Node</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span>Visited Node</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Shortest Path</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded bg-gray-800"
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
        <div className="mt-4 p-4 bg-gray-800 rounded w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {path.map((p) => (
              <div key={p.target} className="bg-gray-700 p-2 rounded">
                <div className="font-bold">
                  Path from {nodes[source]?.label} to {nodes[p.target]?.label}:
                </div>
                <div>
                  {p.path.map((node) => nodes[node]?.label).join(' → ')}
                </div>
                <div>
                  Distance: {distances[distances.length - 1][p.target]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default simulation;