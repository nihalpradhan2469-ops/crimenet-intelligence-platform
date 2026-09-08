import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ZoomIn, ZoomOut, RotateCcw, Search, Filter,
  X, User, Phone, Car, MapPin, Building2, Briefcase, Activity,
  FileText, DollarSign, ShieldAlert, FileSearch, Users, Link2,
  ChevronRight, ArrowRight, Eye, Shield, CheckCircle2, AlertTriangle, Maximize2
} from "lucide-react";
import {
  loadAndAnalyzeGraph,
  GraphNode,
  GraphEdge,
  StreamSource,
  GraphInsight,
  EntityType
} from "../services/graphAnalytics";

// Entity type visual definitions
const ENTITY_CONFIG: Record<EntityType, { label: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  person: { label: "Person", color: "#FF6A00", icon: User },
  phone: { label: "Phone", color: "#FF9A3D", icon: Phone },
  vehicle: { label: "Vehicle", color: "#A6A3B5", icon: Car },
  location: { label: "Location", color: "#60A5FA", icon: MapPin },
  organization: { label: "Organization", color: "#4ADE80", icon: Building2 },
  case: { label: "Case", color: "#FBBF24", icon: Briefcase },
  event: { label: "Event", color: "#FF5C6C", icon: Activity },
  transaction: { label: "Transaction", color: "#FBBF24", icon: DollarSign },
};

export default function NetworkGraph() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Load and calculate mathematical graph metrics
  const graphData = useMemo(() => loadAndAnalyzeGraph(), []);

  // State
  const [nodes, setNodes] = useState<GraphNode[]>(graphData.nodes);
  const [edges] = useState<GraphEdge[]>(graphData.edges);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Canvas Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Center coordinate of intelligence engine
  const CX = 620;
  const CY = 360;

  // Stream origin coordinates on the left
  const STREAM_ORIGINS = useMemo(() => [
    { id: "FIR", y: 150 },
    { id: "CDR", y: 210 },
    { id: "Transactions", y: 270 },
    { id: "Surveillance", y: 330 },
    { id: "Social Media", y: 390 },
    { id: "Criminal History", y: 450 },
    { id: "Intel Reports", y: 510 },
    { id: "Case Records", y: 570 },
  ], []);

  // Automatically select and center node when navigating with query parameters or state
  useEffect(() => {
    const entityParam =
      searchParams.get("entity") ||
      searchParams.get("node") ||
      searchParams.get("id") ||
      (location.state as any)?.entity ||
      (location.state as any)?.nodeId;
    const caseParam = searchParams.get("case") || (location.state as any)?.caseId;
    const searchParam = searchParams.get("search");

    if (entityParam) {
      const q = entityParam.trim().toLowerCase();
      const prsMap: Record<string, string> = {
        "prs-001": "Rahul Sharma",
        "prs-002": "Vikram Desai",
        "prs-003": "Anita Kapoor",
        "prs-004": "Mohammed Raza",
        "prs-005": "Priya Singh",
        "prs-006": "Arjun Mehta",
        "prs-007": "Suresh Nair",
      };
      const mapped = prsMap[q]?.toLowerCase() || q;

      const found = nodes.find((n) => {
        const idMatch = n.id.toLowerCase() === q || n.id.toLowerCase() === mapped;
        const labelMatch = n.label.toLowerCase() === q || n.label.toLowerCase() === mapped;
        const personIdMatch = (n as any).person_id && (n as any).person_id.toLowerCase() === q;
        const aliasMatch = n.aliases?.some(
          (a) => a.toLowerCase() === q || a.toLowerCase() === mapped
        );
        const partialLabelMatch =
          n.label.toLowerCase().includes(q) ||
          (prsMap[q] && n.label.toLowerCase().includes(prsMap[q].toLowerCase()));
        return idMatch || labelMatch || personIdMatch || aliasMatch || partialLabelMatch;
      });

      if (found) {
        setSelectedNode(found);
        setSelectedEdge(null);
        setTypeFilter("all");
        setSelectedStream(null);
        // Center pan on the node, slightly offset for the 340px right panel
        const targetCenterX = CX - 70;
        setPan({
          x: targetCenterX - found.x * zoom,
          y: CY - found.y * zoom,
        });
      } else {
        setSearchQuery(entityParam);
      }
    } else if (caseParam) {
      const q = caseParam.trim().toLowerCase();
      const found = nodes.find(
        (n) =>
          n.caseId?.toLowerCase() === q ||
          n.id.toLowerCase() === q ||
          n.label.toLowerCase() === q
      );
      if (found) {
        setSelectedNode(found);
        setSelectedEdge(null);
        const targetCenterX = CX - 70;
        setPan({
          x: targetCenterX - found.x * zoom,
          y: CY - found.y * zoom,
        });
      }
    } else if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, location.state, nodes, CX, CY, zoom]);

  // Connected nodes & edges calculation for selection highlighting
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>([selectedNode.id]);
    edges.forEach((e) => {
      if (e.source === selectedNode.id) set.add(e.target);
      if (e.target === selectedNode.id) set.add(e.source);
    });
    return set;
  }, [selectedNode, edges]);

  const connectedEdgeIds = useMemo(() => {
    if (selectedEdge) return new Set<string>([selectedEdge.id]);
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNode.id || e.target === selectedNode.id) {
        set.add(e.id);
      }
    });
    return set;
  }, [selectedNode, selectedEdge, edges]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (selectedStream && n.source !== selectedStream) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(query) || n.type.toLowerCase().includes(query);
      }
      return true;
    });
  }, [nodes, typeFilter, selectedStream, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Filtered edges
  const visibleEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodeIds]);

  // Pan and Drag Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "graph-bg") {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: mouseX, y: mouseY } : n))
      );
    }
  }, [isPanning, draggingNodeId, pan, startPan, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setSelectedEdge(null);
    setSelectedStream(null);
    setTypeFilter("all");
    setSearchQuery("");
  };

  // Curved quadratic path helper
  const createSpline = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = x1 + dx * 0.5;
    const cy = y1 + dy * 0.1;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  // S-curve for converging stream ribbons
  const createStreamRibbon = (yStart: number) => {
    const xStart = 160;
    const xEnd = 450;
    const yEnd = CY;
    const cx1 = xStart + 140;
    const cy1 = yStart;
    const cx2 = xEnd - 100;
    const cy2 = yEnd;
    return `M ${xStart} ${yStart} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${xEnd} ${yEnd}`;
  };

  // Branching tree lines for right side
  const createRightBranch = (yEnd: number) => {
    const xStart = 780;
    const yStart = CY;
    const xEnd = 960;
    const cx1 = xStart + 80;
    const cy1 = yStart;
    const cx2 = xEnd - 80;
    const cy2 = yEnd;
    return `M ${xStart} ${yStart} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${xEnd} ${yEnd}`;
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: "100vh",
      background: "#050607",
      color: "#F5F5F5",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* ==================================================================== */}
      {/* 1. TOP HEADER & TELEMETRY CONTROLS                                  */}
      {/* ==================================================================== */}
      <header style={{
        height: 56,
        padding: "0 20px",
        background: "#0B0E11",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 40,
        flexShrink: 0
      }}>
        {/* Title & Live Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF6A00",
              boxShadow: "0 0 10px #FF6A00"
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.2px", color: "#F5F5F5" }}>
              NETWORK INTELLIGENCE
            </span>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,106,0,0.12)",
            border: "1px solid rgba(255,106,0,0.3)",
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.5px",
            color: "#FF9A3D"
          }}>
            <Activity size={12} color="#FF6A00" />
            LIVE GRAPH ANALYSIS
          </div>
        </div>

        {/* Dynamic Telemetry Metrics */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 18, fontSize: 11, color: "#8B929A", borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 20 }}>
            <span>DATA SOURCES: <strong style={{ color: "#F5F5F5" }}>8</strong></span>
            <span>ENTITIES: <strong style={{ color: "#FF9A3D" }}>{visibleNodes.length}</strong></span>
            <span>RELATIONSHIPS: <strong style={{ color: "#F5F5F5" }}>{visibleEdges.length}</strong></span>
            <span>ALERTS: <strong style={{ color: "#FF5C6C" }}>14</strong></span>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", width: 220 }}>
            <Search size={13} color="#8B929A" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search entity, record, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: 32,
                paddingLeft: 30,
                paddingRight: 10,
                background: "#101419",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#F5F5F5",
                fontSize: 12,
                outline: "none"
              }}
            />
          </div>

          {/* Entity Type Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={13} color="#8B929A" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                height: 32,
                background: "#101419",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#F5F5F5",
                fontSize: 12,
                padding: "0 10px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="all">All Entity Types</option>
              <option value="person">Person</option>
              <option value="phone">Phone</option>
              <option value="vehicle">Vehicle</option>
              <option value="location">Location</option>
              <option value="organization">Organization</option>
              <option value="case">Case</option>
              <option value="event">Event</option>
              <option value="transaction">Transaction</option>
            </select>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setShowLabels(!showLabels)}
              style={{
                height: 32,
                padding: "0 10px",
                background: showLabels ? "rgba(255,106,0,0.15)" : "#101419",
                border: `1px solid ${showLabels ? "rgba(255,106,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 6,
                color: showLabels ? "#FF9A3D" : "#8B929A",
                fontSize: 11,
                cursor: "pointer"
              }}
            >
              Labels
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              style={{ width: 32, height: 32, background: "#101419", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#F5F5F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              style={{ width: 32, height: 32, background: "#101419", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#F5F5F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleResetView}
              style={{ width: 32, height: 32, background: "#101419", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#F5F5F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN GRAPH INTERACTIVE WORKSPACE                                  */}
      {/* ==================================================================== */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>

        {/* LEFT SIDE: INCOMING DATA STREAMS OVERLAY */}
        <div style={{
          position: "absolute",
          left: 18,
          top: 30,
          bottom: 70,
          width: 170,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 30,
          pointerEvents: "none"
        }}>
          {graphData.streams.map((stream, idx) => {
            const isSelected = selectedStream === stream.id;
            return (
              <div
                key={stream.id}
                onClick={() => setSelectedStream(isSelected ? null : stream.id)}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: isSelected ? "rgba(255,106,0,0.18)" : "#0B0E11",
                  border: `1px solid ${isSelected ? "#FF6A00" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  boxShadow: isSelected ? "0 0 12px rgba(255,106,0,0.25)" : "0 2px 8px rgba(0,0,0,0.5)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: stream.color,
                    boxShadow: `0 0 8px ${stream.color}`
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? "#FF9A3D" : "#F5F5F5" }}>
                    {stream.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: "#8B929A", fontFamily: "'JetBrains Mono', monospace" }}>
                  {stream.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE: NETWORK ANALYSIS OUTPUT BRANCHES */}
        <div style={{
          position: "absolute",
          right: 18,
          top: 30,
          bottom: 70,
          width: 270,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 30,
          pointerEvents: "none"
        }}>
          {graphData.insights.map((ins, idx) => {
            const isSelected = (ins.nodeId && selectedNode?.id === ins.nodeId) || (ins.edgeId && selectedEdge?.id === ins.edgeId);
            return (
              <div
                key={ins.id}
                onClick={() => {
                  if (ins.nodeId) {
                    const node = nodes.find((n) => n.id === ins.nodeId);
                    if (node) setSelectedNode(node);
                  } else if (ins.edgeId) {
                    const edge = edges.find((e) => e.id === ins.edgeId);
                    if (edge) setSelectedEdge(edge);
                  }
                }}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  background: isSelected ? "#15181F" : "#0B0E11",
                  border: `1px solid ${isSelected ? "#FF6A00" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  boxShadow: isSelected ? "0 0 14px rgba(255,106,0,0.25)" : "0 4px 12px rgba(0,0,0,0.6)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#FF9A3D" }}>
                    {ins.category}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4ADE80", fontFamily: "'JetBrains Mono', monospace" }}>
                    {ins.confidence}%
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F5F5F5", marginBottom: 4 }}>
                  {ins.name}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#8B929A", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>CENTRALITY: <strong style={{ color: "#FF9A3D" }}>{ins.centrality}</strong></span>
                  <span>LINKS: <strong style={{ color: "#F5F5F5" }}>{ins.connections}</strong></span>
                  <span>SRCS: <strong style={{ color: "#F5F5F5" }}>{ins.sources}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE SVG GRAPH ENGINE */}
        <svg
          id="graph-bg"
          ref={svgRef}
          width="100%"
          height="100%"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            flex: 1,
            cursor: isPanning ? "grabbing" : "grab",
            backgroundColor: "#050607"
          }}
        >
          <defs>
            {/* Compass / Orange Radar Glow Filter */}
            <filter id="orangeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* High-priority edge glow */}
            <filter id="edgeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Directional markers */}
            <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#FF6A00" />
            </marker>
            <marker id="arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#5B7CFF" opacity="0.4" />
            </marker>

            {/* Subtle background grid pattern */}
            <pattern id="matrixGrid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Canvas Background Mesh */}
          <rect width="100%" height="100%" fill="url(#matrixGrid)" />

          {/* ZOOM & PAN TRANSFORM GROUP */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

            {/* ================================================================ */}
            {/* A. CONVERGING STREAM RIBBONS (LEFT -> CENTER ENGINE)             */}
            {/* ================================================================ */}
            <g id="converging-ribbons">
              {STREAM_ORIGINS.map((st, i) => {
                const streamItem = graphData.streams.find((s) => s.id === st.id);
                const isSelected = selectedStream === st.id;
                const ribbonPath = createStreamRibbon(st.y);

                return (
                  <g key={st.id} opacity={selectedStream && !isSelected ? 0.15 : 1}>
                    {/* Ambient outer flow glow */}
                    <path
                      d={ribbonPath}
                      fill="none"
                      stroke={streamItem?.color || "#FF6A00"}
                      strokeWidth={isSelected ? 6 : 3}
                      strokeOpacity={isSelected ? 0.4 : 0.08}
                      strokeLinecap="round"
                    />
                    {/* Core pipeline flow ribbon */}
                    <path
                      d={ribbonPath}
                      fill="none"
                      stroke={isSelected ? "#FF9A3D" : streamItem?.color || "#5B7CFF"}
                      strokeWidth={isSelected ? 2 : 1.2}
                      strokeOpacity={isSelected ? 0.9 : 0.35}
                      strokeDasharray={isSelected ? "none" : "5 4"}
                    />
                  </g>
                );
              })}
            </g>

            {/* ================================================================ */}
            {/* B. BRANCHING INSIGHT PATHS (CENTER ENGINE -> RIGHT OUTPUTS)      */}
            {/* ================================================================ */}
            <g id="branching-paths">
              {[120, 240, 360, 480, 600].map((yOut, i) => {
                const branchPath = createRightBranch(yOut);
                return (
                  <g key={`branch-${i}`}>
                    <path
                      d={branchPath}
                      fill="none"
                      stroke="#FF6A00"
                      strokeWidth={3}
                      strokeOpacity={0.08}
                      strokeLinecap="round"
                    />
                    <path
                      d={branchPath}
                      fill="none"
                      stroke="#FF9A3D"
                      strokeWidth={1.2}
                      strokeOpacity={0.4}
                      strokeDasharray="4 3"
                    />
                  </g>
                );
              })}
            </g>

            {/* ================================================================ */}
            {/* C. CENTER NETWORK INTELLIGENCE VISUALIZATION (CONCENTRIC RINGS)   */}
            {/* ================================================================ */}
            <g id="central-intelligence-engine">
              {/* Layer 1: Compass / Radar Radial Tick Ring (r = 340) */}
              <circle cx={CX} cy={CY} r={340} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="2 6" />
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * 2 * Math.PI;
                const isMajor = i % 5 === 0;
                const rIn = isMajor ? 332 : 336;
                const rOut = 340;
                const x1 = CX + rIn * Math.cos(angle);
                const y1 = CY + rIn * Math.sin(angle);
                const x2 = CX + rOut * Math.cos(angle);
                const y2 = CY + rOut * Math.sin(angle);
                return (
                  <line
                    key={`tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? "rgba(255,106,0,0.5)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                );
              })}

              {/* Layer 2: Rotating / Segmented Outer Intelligence Telemetry Ring (r = 300) */}
              <circle cx={CX} cy={CY} r={300} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              <circle
                cx={CX}
                cy={CY}
                r={300}
                fill="none"
                stroke="#FF6A00"
                strokeWidth={1.5}
                strokeDasharray="40 180 60 120"
                opacity={0.65}
              />

              {/* Layer 3: Concentric Middle Orbit Dot Rings (r = 210, r = 130) */}
              <circle cx={CX} cy={CY} r={210} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="3 8" />
              <circle cx={CX} cy={CY} r={130} fill="none" stroke="rgba(255,106,0,0.12)" strokeWidth={1} strokeDasharray="2 4" />

              {/* Layer 4: Central Intelligence Core HUD Hub */}
              <circle
                cx={CX}
                cy={CY}
                r={64}
                fill="#090C0F"
                stroke="#FF6A00"
                strokeWidth={2}
                filter="url(#orangeGlow)"
              />
              <circle
                cx={CX}
                cy={CY}
                r={56}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />

              {/* Central Core Text Labels */}
              <text x={CX} y={CY - 12} textAnchor="middle" fill="#8B929A" fontSize={8} fontWeight={700} letterSpacing="1.8px">
                COMMAND HUB
              </text>
              <text x={CX} y={CY + 3} textAnchor="middle" fill="#F5F5F5" fontSize={11} fontWeight={800} letterSpacing="1.2px">
                NETWORK
              </text>
              <text x={CX} y={CY + 16} textAnchor="middle" fill="#FF9A3D" fontSize={10} fontWeight={800} letterSpacing="1px">
                INTELLIGENCE
              </text>
              <text x={CX} y={CY + 30} textAnchor="middle" fill="#4ADE80" fontSize={7.5} fontWeight={600} letterSpacing="0.8px">
                ● LIVE ANALYSIS
              </text>
            </g>

            {/* ================================================================ */}
            {/* D. REAL GRAPH EDGES / RELATIONSHIP SPLINES                       */}
            {/* ================================================================ */}
            <g id="graph-edges">
              {visibleEdges.map((edge) => {
                const s = nodes.find((n) => n.id === edge.source);
                const t = nodes.find((n) => n.id === edge.target);
                if (!s || !t) return null;

                const isEdgeSelected = selectedEdge?.id === edge.id;
                const isConnectedEdge = connectedEdgeIds.has(edge.id);
                const isDimmed = (selectedNode || selectedEdge) && !isConnectedEdge;
                const isPriority = edge.priority;

                const pathString = createSpline(s.x, s.y, t.x, t.y);

                return (
                  <g
                    key={edge.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdge(isEdgeSelected ? null : edge);
                      setSelectedNode(null);
                    }}
                    style={{ cursor: "pointer" }}
                    opacity={isDimmed ? 0.12 : 1}
                  >
                    {/* Transparent thick hit-area */}
                    <path d={pathString} fill="none" stroke="transparent" strokeWidth={14} />

                    {/* Ambient Glow for Priority / Selected edges */}
                    {(isEdgeSelected || isPriority) && (
                      <path
                        d={pathString}
                        fill="none"
                        stroke="#FF6A00"
                        strokeWidth={isEdgeSelected ? 5 : 3.5}
                        strokeOpacity={0.25}
                        filter="url(#edgeGlow)"
                      />
                    )}

                    {/* Core edge path */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={isEdgeSelected ? "#FF9A3D" : isPriority ? "#FF6A00" : "rgba(91, 124, 255, 0.35)"}
                      strokeWidth={isEdgeSelected ? 2.5 : isPriority ? 1.6 : 1}
                      strokeDasharray={isPriority ? "none" : "4 4"}
                      markerEnd={isEdgeSelected || isPriority ? "url(#arrow-orange)" : "url(#arrow-muted)"}
                    />

                    {/* Edge Label (only when selected or priority with showLabels) */}
                    {(isEdgeSelected || (showLabels && isPriority)) && (
                      <text
                        x={(s.x + t.x) / 2}
                        y={(s.y + t.y) / 2 - 6}
                        textAnchor="middle"
                        fill={isEdgeSelected ? "#FF9A3D" : "#8B929A"}
                        fontSize={8.5}
                        fontWeight={600}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {edge.label} ({edge.confidence}%)
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* ================================================================ */}
            {/* E. REAL GRAPH NODES (TIERED CONCENTRIC ENTITY NODES)             */}
            {/* ================================================================ */}
            <g id="graph-nodes">
              {visibleNodes.map((node) => {
                const conf = ENTITY_CONFIG[node.type] || ENTITY_CONFIG.person;
                const IconComponent = conf.icon;
                const isNodeSelected = selectedNode?.id === node.id;
                const isConn = connectedNodeIds.has(node.id);
                const isDimmed = (selectedNode || selectedEdge) && !isNodeSelected && !isConn;
                const isHighCentrality = node.centrality >= 0.8;

                // Node size dynamically reflects calculated centrality
                const r = node.type === "person" ? 18 : 14;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: "pointer" }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingNodeId(node.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(isNodeSelected ? null : node);
                      setSelectedEdge(null);
                    }}
                    opacity={isDimmed ? 0.15 : 1}
                  >
                    {/* High Centrality Radial Halo */}
                    {isHighCentrality && (
                      <circle
                        r={r + 8}
                        fill="none"
                        stroke="#FF6A00"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        opacity={0.65}
                      />
                    )}

                    {/* Selected Node Ring */}
                    {isNodeSelected && (
                      <circle
                        r={r + 6}
                        fill="none"
                        stroke="#FF9A3D"
                        strokeWidth={2}
                        filter="url(#orangeGlow)"
                      />
                    )}

                    {/* Node Circle Body */}
                    <circle
                      r={r}
                      fill="#0D1117"
                      stroke={isNodeSelected ? "#FF9A3D" : isHighCentrality ? "#FF6A00" : conf.color}
                      strokeWidth={isNodeSelected ? 2.5 : 1.5}
                      filter={isNodeSelected ? "url(#orangeGlow)" : "none"}
                    />

                    {/* Center Icon */}
                    <g transform={`translate(-${r / 2}, -${r / 2})`} style={{ pointerEvents: "none" }}>
                      <IconComponent size={r} color={isNodeSelected ? "#FF9A3D" : conf.color} />
                    </g>

                    {/* Dynamic Centrality Badge on Top */}
                    {isHighCentrality && (
                      <g transform={`translate(0, -${r + 4})`} style={{ pointerEvents: "none" }}>
                        <rect x="-14" y="-8" width="28" height="10" rx="3" fill="#FF6A00" />
                        <text x="0" y="-1" textAnchor="middle" fill="#050607" fontSize={7} fontWeight={800}>
                          {node.centrality}
                        </text>
                      </g>
                    )}

                    {/* Node Text Label */}
                    {showLabels && (
                      <text
                        y={r + 13}
                        textAnchor="middle"
                        fill={isNodeSelected ? "#FF9A3D" : isConn ? "#F5F5F5" : "#8B929A"}
                        fontSize={9.5}
                        fontWeight={isNodeSelected ? 700 : 500}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

          </g>
        </svg>

        {/* ================================================================== */}
        {/* 3. SLIDING FORENSIC INSPECTION DRAWER (NODE / EDGE DETAIL)         */}
        {/* ================================================================== */}
        {(selectedNode || selectedEdge) && (
          <div style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 340,
            background: "rgba(11, 14, 17, 0.96)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.8)",
            backdropFilter: "blur(16px)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.15s ease-out"
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#FF9A3D", textTransform: "uppercase" }}>
                  {selectedNode ? `${selectedNode.type} PROFILE` : "RELATIONSHIP LINK"}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#F5F5F5", marginTop: 2 }}>
                  {selectedNode ? selectedNode.label : selectedEdge?.label}
                </div>
              </div>
              <button
                onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                style={{ background: "none", border: "none", color: "#8B929A", cursor: "pointer", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
              {selectedNode ? (
                <>
                  {/* Real Centrality Analytics Panel */}
                  <div style={{
                    background: "#101419",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "14px",
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8B929A", marginBottom: 10, textTransform: "uppercase" }}>
                      Topological Graph Metrics
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "#0B0E11", padding: "8px 10px", borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: "#8B929A" }}>DEGREE CENTRALITY</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#FF6A00", fontFamily: "'JetBrains Mono', monospace" }}>
                          {selectedNode.degreeCentrality}
                        </div>
                      </div>
                      <div style={{ background: "#0B0E11", padding: "8px 10px", borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: "#8B929A" }}>BETWEENNESS</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#FF9A3D", fontFamily: "'JetBrains Mono', monospace" }}>
                          {selectedNode.betweennessCentrality}
                        </div>
                      </div>
                      <div style={{ background: "#0B0E11", padding: "8px 10px", borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: "#8B929A" }}>CLOSENESS</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>
                          {selectedNode.closenessCentrality}
                        </div>
                      </div>
                      <div style={{ background: "#0B0E11", padding: "8px 10px", borderRadius: 6 }}>
                        <div style={{ fontSize: 9, color: "#8B929A" }}>COMPOSITE RANK</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#4ADE80", fontFamily: "'JetBrains Mono', monospace" }}>
                          {selectedNode.centrality}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div style={{ marginBottom: 16, fontSize: 12, lineHeight: 1.6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#8B929A" }}>Source Document</span>
                      <strong style={{ color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{selectedNode.sourceRec} ({selectedNode.source})</strong>
                    </div>
                    {selectedNode.caseId && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "#8B929A" }}>Associated Case</span>
                        <strong style={{ color: "#FF9A3D" }}>{selectedNode.caseId}</strong>
                      </div>
                    )}
                    {selectedNode.role && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "#8B929A" }}>Intel Role</span>
                        <strong style={{ color: "#F5F5F5" }}>{selectedNode.role}</strong>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#8B929A" }}>Confidence Score</span>
                      <strong style={{ color: "#4ADE80" }}>{selectedNode.confidence}%</strong>
                    </div>
                  </div>

                  {/* Connected Entities List */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8B929A", marginBottom: 8, textTransform: "uppercase" }}>
                      Connected Entities ({selectedNode.connectionsCount})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {edges
                        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((e) => {
                          const otherId = e.source === selectedNode.id ? e.target : e.source;
                          const otherNode = nodes.find((n) => n.id === otherId);
                          if (!otherNode) return null;
                          return (
                            <div
                              key={e.id}
                              onClick={() => setSelectedNode(otherNode)}
                              style={{
                                background: "#101419",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 6,
                                padding: "8px 10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer"
                              }}
                            >
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#F5F5F5" }}>{otherNode.label}</div>
                                <div style={{ fontSize: 10, color: "#8B929A" }}>{e.label} · {e.confidence}%</div>
                              </div>
                              <ChevronRight size={14} color="#8B929A" />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : selectedEdge ? (
                <>
                  <div style={{
                    background: "#101419",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "14px",
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8B929A", marginBottom: 10, textTransform: "uppercase" }}>
                      Relationship Telemetry
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8B929A" }}>Source Entity</span>
                        <strong style={{ color: "#F5F5F5" }}>{nodes.find((n) => n.id === selectedEdge.source)?.label}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8B929A" }}>Target Entity</span>
                        <strong style={{ color: "#F5F5F5" }}>{nodes.find((n) => n.id === selectedEdge.target)?.label}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8B929A" }}>Source Channel</span>
                        <strong style={{ color: "#FF9A3D" }}>{selectedEdge.source_type}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8B929A" }}>Evidence Record</span>
                        <strong style={{ color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{selectedEdge.source_rec}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8B929A" }}>Confidence</span>
                        <strong style={{ color: "#4ADE80" }}>{selectedEdge.confidence}%</strong>
                      </div>
                      {selectedEdge.date && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#8B929A" }}>Intercept Date</span>
                          <strong style={{ color: "#8B929A" }}>{selectedEdge.date}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => {
                    let target = "P0001";
                    if (selectedNode) {
                      target = (selectedNode as any).person_id || selectedNode.id || selectedNode.label;
                    } else if (selectedEdge) {
                      const sNode = nodes.find(n => n.id === selectedEdge.source);
                      target = (sNode as any)?.person_id || selectedEdge.source;
                    }
                    navigate(`/investigations?entity=${encodeURIComponent(target)}`);
                  }}
                  style={{
                    height: 36,
                    background: "#FF6A00",
                    color: "#050607",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Open Case Intelligence Report
                </button>
                <button
                  onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                  style={{
                    height: 34,
                    background: "transparent",
                    color: "#8B929A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  Dismiss Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. BOTTOM INTELLIGENCE METRICS TELEMETRY BAR                         */}
      {/* ==================================================================== */}
      <footer style={{
        height: 52,
        padding: "0 24px",
        background: "#0B0E11",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 40,
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              ENTITIES ANALYZED
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.entitiesAnalyzed.toLocaleString()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              RELATIONSHIPS
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FF9A3D", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.relationships.toLocaleString()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              ACTIVE CASES
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.activeCases}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              POTENTIAL LINKS
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FBBF24", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.potentialLinks}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              ANOMALIES
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FF5C6C", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.anomalies}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", color: "#8B929A" }}>
              HIGH CENTRALITY
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FF6A00", fontFamily: "'JetBrains Mono', monospace" }}>
              {graphData.metrics.highCentralityEntities}
            </span>
          </div>
        </div>

        {/* Live Status Telemetry */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#8B929A" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80" }} />
          <span>GRAPH ENGINE ONLINE · BRANDES ALGORITHM ACTIVE</span>
        </div>
      </footer>

    </div>
  );
}
