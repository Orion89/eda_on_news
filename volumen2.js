/**
 * Volumen II: La Geometría de la Cultura
 * Script principal para el Mapa de Constelaciones (Force-Directed Graph)
 * Creado con D3.js v7 y Scrollama v3
 */

// --- Global State & Configuration ---
let rawSimilarityData = null;
let currentDimension = "moral";
let interactiveDimension = "nationalism";

let svgConstellation = null;
let gLinks = null;
let gNodes = null;
let simulation = null;

let widthConstellation = 800;
let heightConstellation = 600;
const nodeRadius = 26;

let nodesData = [];
let linksData = [];

let tooltip = null;
const scrollerConstellation = scrollama();

// Country metadata with official palette
const countryMetadata = {
    "chile": {
        code: "CL",
        name: "Chile",
        color: "var(--color-cl)",
        hex: "#d9383a"
    },
    "argentina": {
        code: "AR",
        name: "Argentina",
        color: "var(--color-ar)",
        hex: "#3a86c8"
    },
    "espana": {
        code: "ES",
        name: "España",
        color: "var(--color-es)",
        hex: "#f59e0b"
    },
    "españa": {
        code: "ES",
        name: "España",
        color: "var(--color-es)",
        hex: "#f59e0b"
    },
    "mexico": {
        code: "MX",
        name: "México",
        color: "var(--color-mx)",
        hex: "#10b981"
    },
    "méxico": {
        code: "MX",
        name: "México",
        color: "var(--color-mx)",
        hex: "#10b981"
    }
};

// Dimension dictionary with Spanish labels and descriptions
const dimensionInfo = {
    "moral": {
        key: "moral",
        label: "Moral",
        poles: "Bien vs. Mal",
        icon: "⚖️",
        desc: "Conceptos de ética, rectitud y justicia"
    },
    "order_and_legality": {
        key: "order_and_legality",
        label: "Orden y Legalidad",
        poles: "Legal vs. Ilegal",
        icon: "📜",
        desc: "Institucionalidad, leyes y normas públicas"
    },
    "gender": {
        key: "gender",
        label: "Género",
        poles: "Masculino vs. Femenino",
        icon: "⚧",
        desc: "Representaciones del género y roles"
    },
    "affluence": {
        key: "affluence",
        label: "Riqueza",
        poles: "Afluencia vs. Pobreza",
        icon: "💰",
        desc: "Estatus socioeconómico y recursos"
    },
    "time_and_change": {
        key: "time_and_change",
        label: "Tiempo y Cambio",
        poles: "Pasado vs. Futuro",
        icon: "⏳",
        desc: "Inercia histórica y expectativas de futuro"
    },
    "cultural": {
        key: "cultural",
        label: "Cultura",
        poles: "Educación y Creación",
        icon: "🎨",
        desc: "Patrimonio, arte y capital educativo"
    },
    "age": {
        key: "age",
        label: "Edad",
        poles: "Joven vs. Viejo",
        icon: "🌱",
        desc: "Ciclo biológico, juventud y longevidad"
    },
    "political_ideology": {
        key: "political_ideology",
        label: "Ideología Política",
        poles: "Izquierda vs. Derecha",
        icon: "🏛️",
        desc: "Posicionamiento político y doctrina social"
    },
    "nationalism": {
        key: "nationalism",
        label: "Nacionalismo",
        poles: "Nacional vs. Extranjero",
        icon: "🚩",
        desc: "Soberanía, identidad patria y extranjería"
    }
};

// --- D3 Scales (Exaggerated for high dramatic contrast) ---
const strokeWidthScale = d3.scaleLinear()
    .domain([0.40, 1.0])
    .range([1.5, 12])
    .clamp(true);

const strokeOpacityScale = d3.scaleLinear()
    .domain([0.40, 1.0])
    .range([0.15, 0.88])
    .clamp(true);

/**
 * Calculates adaptive link distance according to canvas dimensions.
 * Similarities range between 0.40 and 1.0.
 * High similarity -> short distance (nodes pull together).
 * Low similarity -> long distance (nodes push away).
 */
function getTargetLinkDistance(similarity, w, h) {
    const minDim = Math.min(w, h);
    const maxDist = Math.max(160, minDim * 0.58);
    const minDist = Math.max(55, minDim * 0.18);
    const scale = d3.scaleLinear()
        .domain([0.40, 1.0])
        .range([maxDist, minDist])
        .clamp(true);
    return scale(similarity);
}

/**
 * Setup Tooltip element
 */
function setupTooltip() {
    tooltip = d3.select("body")
        .selectAll(".tooltip")
        .data([null])
        .join("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "1000")
        .style("pointer-events", "none")
        .style("opacity", 0);
}

function positionTooltip(event) {
    const tipNode = tooltip.node();
    const tipW = tipNode ? tipNode.offsetWidth : 200;
    const pageX = event.pageX || (event.touches && event.touches[0] ? event.touches[0].pageX : 0);
    const pageY = event.pageY || (event.touches && event.touches[0] ? event.touches[0].pageY : 0);

    let x = pageX + 16;
    let y = pageY - 24;

    if (x + tipW > window.innerWidth - 15) {
        x = Math.max(10, pageX - tipW - 16);
    }
    if (y < window.scrollY + 10) {
        y = pageY + 20;
    }

    tooltip.style("left", `${x}px`).style("top", `${y}px`);
}

/**
 * Build graph nodes and links for a specific dimension key.
 */
function buildGraphData(dimKey) {
    if (!rawSimilarityData || !rawSimilarityData.similarities[dimKey]) return { nodes: [], links: [] };

    const matrix = rawSimilarityData.similarities[dimKey];
    const order = rawSimilarityData.country_order; // ["chile", "argentina", "espana", "mexico"]

    // Preserve existing node positions if already present
    const existingNodeMap = new Map();
    nodesData.forEach(n => existingNodeMap.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy }));

    const nodes = order.map((id, index) => {
        const meta = countryMetadata[id] || { code: id.toUpperCase(), name: id, color: "#777", hex: "#777" };
        const prev = existingNodeMap.get(id);
        return {
            id,
            index,
            code: meta.code,
            name: meta.name,
            color: meta.color,
            hex: meta.hex,
            x: prev ? prev.x : (widthConstellation / 2 + (Math.random() - 0.5) * 80),
            y: prev ? prev.y : (heightConstellation / 2 + (Math.random() - 0.5) * 80),
            vx: prev ? prev.vx : 0,
            vy: prev ? prev.vy : 0
        };
    });

    const links = [];
    for (let i = 0; i < order.length; i++) {
        for (let j = i + 1; j < order.length; j++) {
            const val = matrix[i][j];
            links.push({
                source: order[i],
                target: order[j],
                sourceName: countryMetadata[order[i]].name,
                targetName: countryMetadata[order[j]].name,
                sourceColor: countryMetadata[order[i]].color,
                targetColor: countryMetadata[order[j]].color,
                value: val,
                id: `${order[i]}-${order[j]}`
            });
        }
    }

    return { nodes, links };
}

/**
 * Initialize SVG and Force Simulation
 */
function setupD3ConstellationCanvas() {
    const canvas = document.getElementById("d3-canvas-constellation");
    if (!canvas || !rawSimilarityData) return;

    // Clear placeholder spinner
    canvas.innerHTML = "";
    widthConstellation = canvas.clientWidth || 800;
    heightConstellation = canvas.clientHeight || 560;

    svgConstellation = d3.select(canvas)
        .append("svg")
        .attr("width", widthConstellation)
        .attr("height", heightConstellation)
        .attr("viewBox", `0 0 ${widthConstellation} ${heightConstellation}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Group containers for layered rendering (links beneath nodes)
    gLinks = svgConstellation.append("g").attr("class", "constellation-links-layer");
    gNodes = svgConstellation.append("g").attr("class", "constellation-nodes-layer");

    // Initialize graph data
    const data = buildGraphData(currentDimension);
    nodesData = data.nodes;
    linksData = data.links;

    // Force simulation setup
    simulation = d3.forceSimulation(nodesData)
        .force("link", d3.forceLink(linksData)
            .id(d => d.id)
            .distance(d => getTargetLinkDistance(d.value, widthConstellation, heightConstellation))
            .strength(0.78))
        .force("charge", d3.forceManyBody().strength(-240))
        .force("center", d3.forceCenter(widthConstellation / 2, heightConstellation / 2))
        .force("collide", d3.forceCollide().radius(nodeRadius + 18).iterations(3))
        .force("x", d3.forceX(widthConstellation / 2).strength(0.09))
        .force("y", d3.forceY(heightConstellation / 2).strength(0.09))
        .on("tick", ticked);

    renderGraphElements();
    updateControlsAndInsights(currentDimension);
}

/**
 * Simulation tick handler: updates link and node SVG coordinates with boundary protection.
 */
function ticked() {
    if (!svgConstellation) return;

    // Constrain nodes inside canvas bounds
    const pad = nodeRadius + 18;
    nodesData.forEach(d => {
        d.x = Math.max(pad, Math.min(widthConstellation - pad, d.x));
        d.y = Math.max(pad, Math.min(heightConstellation - pad, d.y));
    });

    // Update links
    gLinks.selectAll(".constellation-link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    // Update link midpoint label badges
    gLinks.selectAll(".constellation-link-label-group")
        .attr("transform", d => {
            const mx = (d.source.x + d.target.x) / 2;
            const my = (d.source.y + d.target.y) / 2;
            return `translate(${mx}, ${my})`;
        });

    // Update nodes
    gNodes.selectAll(".constellation-node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
}

/**
 * Renders nodes, links and interactive handles in D3.
 */
function renderGraphElements() {
    // 1. Render Links
    const linkSel = gLinks.selectAll(".constellation-link")
        .data(linksData, d => d.id)
        .join("line")
        .attr("class", "constellation-link")
        .attr("stroke-width", d => strokeWidthScale(d.value))
        .attr("stroke-opacity", d => strokeOpacityScale(d.value))
        .on("mouseover", handleLinkMouseOver)
        .on("mousemove", positionTooltip)
        .on("mouseleave", handleMouseLeave);

    // Midpoint link labels (badge with similarity)
    const labelSel = gLinks.selectAll(".constellation-link-label-group")
        .data(linksData, d => d.id)
        .join(enter => {
            const g = enter.append("g").attr("class", "constellation-link-label-group constellation-link-label");
            g.append("rect")
                .attr("class", "constellation-link-bg")
                .attr("x", -19)
                .attr("y", -9)
                .attr("width", 38)
                .attr("height", 18);
            g.append("text")
                .attr("class", "constellation-link-text")
                .text(d => d.value.toFixed(2));
            return g;
        }, update => {
            update.select(".constellation-link-text")
                .text(d => d.value.toFixed(2));
            return update;
        });

    // 2. Render Nodes
    const nodeSel = gNodes.selectAll(".constellation-node")
        .data(nodesData, d => d.id)
        .join(enter => {
            const g = enter.append("g")
                .attr("class", d => `constellation-node node-group node-${d.id}`)
                .call(d3.drag()
                    .on("start", dragStarted)
                    .on("drag", dragged)
                    .on("end", dragEnded))
                .on("mouseover", handleNodeMouseOver)
                .on("mousemove", positionTooltip)
                .on("mouseleave", handleMouseLeave);

            // Node Circle
            g.append("circle")
                .attr("class", "constellation-node-circle")
                .attr("r", nodeRadius)
                .attr("fill", d => d.color);

            // Country Initials / Code
            g.append("text")
                .attr("class", "constellation-node-code")
                .attr("dy", 1)
                .text(d => d.code);

            // Country Name Label beneath
            g.append("text")
                .attr("class", "constellation-node-name")
                .attr("y", nodeRadius + 16)
                .text(d => d.name);

            return g;
        });
}

/**
 * Node drag handlers with D3 force simulation reheat
 */
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = Math.max(nodeRadius + 15, Math.min(widthConstellation - nodeRadius - 15, event.x));
    d.fy = Math.max(nodeRadius + 15, Math.min(heightConstellation - nodeRadius - 15, event.y));
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

/**
 * Tooltip on link hover
 */
function handleLinkMouseOver(event, d) {
    d3.select(this)
        .transition().duration(150)
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", Math.max(strokeWidthScale(d.value) * 1.3, 5));

    const dim = dimensionInfo[currentDimension] || { label: currentDimension, poles: "" };

    tooltip.transition().duration(100).style("opacity", 0.98);
    tooltip.html(`
        <div class="tooltip-title">${d.sourceName} &mdash; ${d.targetName}</div>
        <div class="tooltip-row"><strong>Dimensión:</strong> ${dim.label} (${dim.poles})</div>
        <div class="tooltip-row"><strong>Similitud Coseno:</strong> ${d.value.toFixed(4)}</div>
        <div class="tooltip-row" style="font-size:0.75rem; color:#b5b0aa; margin-top:0.35rem;">
            ${d.value >= 0.80 ? '🟢 Alta cohesión conceptual' : (d.value >= 0.60 ? '🟡 Divergencia moderada' : '🔴 Fractura discursiva')}
        </div>
    `);
    positionTooltip(event);
}

/**
 * Tooltip on node hover
 */
function handleNodeMouseOver(event, d) {
    d3.select(this).select(".constellation-node-circle")
        .transition().duration(150)
        .attr("r", nodeRadius + 4);

    const matrix = rawSimilarityData.similarities[currentDimension];
    const order = rawSimilarityData.country_order;
    const myIndex = d.index;

    let rowsHtml = "";
    order.forEach((otherId, idx) => {
        if (idx !== myIndex) {
            const otherMeta = countryMetadata[otherId];
            const sim = matrix[myIndex][idx];
            rowsHtml += `
                <div class="tooltip-row" style="margin-top:0.25rem;">
                    <span style="color:${otherMeta.color}; font-weight:700;">${otherMeta.name}:</span>
                    <strong>${sim.toFixed(3)}</strong>
                </div>
            `;
        }
    });

    tooltip.transition().duration(100).style("opacity", 0.98);
    tooltip.html(`
        <div class="tooltip-title" style="color:${d.color}">${d.name} (${d.code})</div>
        <div style="font-size:0.75rem; color:#b5b0aa; margin-bottom:0.3rem;">Similitud en ${dimensionInfo[currentDimension]?.label}:</div>
        ${rowsHtml}
    `);
    positionTooltip(event);
}

function handleMouseLeave() {
    gLinks.selectAll(".constellation-link")
        .transition().duration(200)
        .attr("stroke-width", d => strokeWidthScale(d.value))
        .attr("stroke-opacity", d => strokeOpacityScale(d.value));

    gNodes.selectAll(".constellation-node-circle")
        .transition().duration(200)
        .attr("r", nodeRadius);

    tooltip.transition().duration(120).style("opacity", 0);
}

/**
 * Updates graph dimension with smooth transitions and physics reheat.
 */
function updateConstellationDimension(newDimKey) {
    if (!rawSimilarityData || !rawSimilarityData.similarities[newDimKey]) return;
    currentDimension = newDimKey;

    const matrix = rawSimilarityData.similarities[newDimKey];
    const order = rawSimilarityData.country_order;

    // Update link data values
    linksData.forEach(link => {
        const i = order.indexOf(link.source.id || link.source);
        const j = order.indexOf(link.target.id || link.target);
        if (i !== -1 && j !== -1) {
            link.value = matrix[i][j];
        }
    });

    // Smooth transition on links
    gLinks.selectAll(".constellation-link")
        .data(linksData, d => d.id)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr("stroke-width", d => strokeWidthScale(d.value))
        .attr("stroke-opacity", d => strokeOpacityScale(d.value));

    // Update link midpoint label text
    gLinks.selectAll(".constellation-link-text")
        .data(linksData, d => d.id)
        .text(d => d.value.toFixed(2));

    // Smooth transition on link distance forces and reheat simulation
    simulation.force("link")
        .distance(d => getTargetLinkDistance(d.value, widthConstellation, heightConstellation));

    simulation.alpha(0.85).restart();

    updateControlsAndInsights(newDimKey);
}

/**
 * Updates status bar badge, average similarity, and storytelling insight cards.
 */
function updateControlsAndInsights(dimKey) {
    const dim = dimensionInfo[dimKey] || { label: dimKey, poles: "", icon: "🌐" };
    const matrix = rawSimilarityData.similarities[dimKey];
    const order = rawSimilarityData.country_order;

    // Compute average similarity across all 6 pairs
    let totalSim = 0;
    let minPair = { pair: "", val: 1.0 };
    let maxPair = { pair: "", val: 0.0 };

    linksData.forEach(l => {
        totalSim += l.value;
        if (l.value < minPair.val) minPair = { pair: `${l.sourceName} – ${l.targetName}`, val: l.value };
        if (l.value > maxPair.val) maxPair = { pair: `${l.sourceName} – ${l.targetName}`, val: l.value };
    });
    const avgSim = totalSim / linksData.length;

    // Update top controls badge
    const badge = document.getElementById("constellation-active-dim-badge");
    if (badge) {
        badge.innerText = `Dimensión: ${dim.label} (${dim.poles})`;
    }

    const avgBadge = document.getElementById("constellation-avg-similarity");
    if (avgBadge) {
        avgBadge.innerText = `Similitud promedio: ${avgSim.toFixed(3)}`;
    }

    // Update sticky figure storytelling cards
    const panel = document.getElementById("storytelling-insights-constellation");
    if (panel) {
        // Render 4 country cards showing their average affinity to others in this dimension
        const cardsHtml = order.map((id, i) => {
            const meta = countryMetadata[id];
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                if (i !== j) sum += matrix[i][j];
            }
            const countryAvg = sum / 3;
            return `
                <div class="insight-card country-border-${meta.code.toLowerCase()}">
                    <div class="insight-country" style="color:${meta.color}">${meta.name}</div>
                    <div class="insight-stat">${countryAvg.toFixed(3)}</div>
                    <div class="insight-label">Afinidad Media (${dim.label})</div>
                </div>
            `;
        }).join("");

        panel.innerHTML = `<div class="insights-grid">${cardsHtml}</div>`;
    }
}

/**
 * Populate interactive filter buttons in Step 4.
 */
function setupInteractiveFilterButtons() {
    const container = document.getElementById("constellation-filter-buttons");
    if (!container || !rawSimilarityData) return;

    container.innerHTML = "";

    const keys = Object.keys(dimensionInfo);
    keys.forEach(key => {
        const info = dimensionInfo[key];
        const btn = document.createElement("button");
        btn.className = `filter-btn ${key === interactiveDimension ? "filter-btn-active active" : ""}`;
        btn.setAttribute("data-dim", key);
        btn.innerHTML = `<span>${info.icon}</span> <span>${info.label}</span>`;

        btn.addEventListener("click", () => {
            container.querySelectorAll(".filter-btn").forEach(b => {
                b.classList.remove("filter-btn-active", "active");
            });
            btn.classList.add("filter-btn-active", "active");
            interactiveDimension = key;
            updateConstellationDimension(key);
        });

        container.appendChild(btn);
    });
}

/**
 * Initialize Scrollama for Volumen II.
 */
function initScrollama() {
    scrollerConstellation
        .setup({
            step: "#scrolly-constellation article .step",
            offset: 0.52,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const stepEl = response.element;

            document.querySelectorAll("#scrolly-constellation article .step")
                .forEach((el, idx) => el.classList.toggle("is-active", idx === stepIndex));

            const stepDim = stepEl.getAttribute("data-dimension");
            if (stepDim === "interactive") {
                updateConstellationDimension(interactiveDimension);
            } else if (stepDim) {
                updateConstellationDimension(stepDim);
            }
        });
}

// ==========================================================================
// SECCIÓN 2: ARCO DE PROYECCIÓN 1D (LA REGLA DE MEDIR INVISIBLE)
// ==========================================================================

let rawProjectionData = null;
let currentProjectionDim = "moral";
let currentProjectionWord = "manifestante";
let interactiveProjectionDim = "moral";
let interactiveProjectionWord = "manifestante";

let svgProjection = null;
let gProjectionBase = null;
let gProjectionLines = null;
let gProjectionNeedles = null;
let gProjectionMarkers = null;
let gProjectionNodes = null;
let gProjectionLabels = null;

let widthProjection = 800;
let heightProjection = 560;
const scrollerProjection = scrollama();

const projectionDimensions = [
    { key: "moral", label: "Moral", icon: "⚖️" },
    { key: "nationalism", label: "Nacionalismo", icon: "🚩" },
    { key: "gender", label: "Género", icon: "⚧" },
    { key: "time_and_change", label: "Tiempo y Cambio", icon: "⏳" }
];

/**
 * Setup D3 Projection Arc Canvas
 */
function setupD3ProjectionCanvas() {
    const canvas = document.getElementById("d3-canvas-projection");
    if (!canvas) return;

    canvas.innerHTML = "";
    widthProjection = canvas.clientWidth || 800;
    heightProjection = canvas.clientHeight || 560;

    svgProjection = d3.select(canvas)
        .append("svg")
        .attr("id", "svg-projection")
        .attr("class", "projection-svg")
        .attr("width", widthProjection)
        .attr("height", heightProjection)
        .attr("viewBox", `0 0 ${widthProjection} ${heightProjection}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Proper z-order layering
    gProjectionBase = svgProjection.append("g").attr("class", "g-arc-base");
    gProjectionLines = svgProjection.append("g").attr("class", "g-arc-lines");
    gProjectionNeedles = svgProjection.append("g").attr("class", "g-arc-needles");
    gProjectionMarkers = svgProjection.append("g").attr("class", "g-arc-markers");
    gProjectionNodes = svgProjection.append("g").attr("class", "g-arc-nodes");
    gProjectionLabels = svgProjection.append("g").attr("class", "g-arc-labels");
}

/**
 * Mathematical Semicircular Projection Arc
 * Animates vectors with d3.transition().duration(800).ease(d3.easeCubicOut)
 * Handles Enter, Update, Exit for all 4 countries
 */
function renderArc(dimension, word) {
    if (!rawProjectionData || !rawProjectionData[dimension] || !rawProjectionData[dimension][word]) {
        console.warn(`[Projection Arc] Datos no encontrados para: ${dimension} -> ${word}`);
        return;
    }

    currentProjectionDim = dimension;
    currentProjectionWord = word;

    const items = rawProjectionData[dimension][word];
    const polesStr = items[0]?.poles || "Negativo <-> Positivo";
    const [poleNeg, polePos] = polesStr.split(" <-> ");

    const canvas = document.getElementById("d3-canvas-projection");
    if (!canvas || !svgProjection) return;

    widthProjection = canvas.clientWidth || 800;
    heightProjection = canvas.clientHeight || 560;

    svgProjection
        .attr("width", widthProjection)
        .attr("height", heightProjection)
        .attr("viewBox", `0 0 ${widthProjection} ${heightProjection}`);

    const cx = widthProjection / 2;
    const cy = heightProjection - 65;
    const R = Math.max(90, Math.min(widthProjection * 0.42, cy - 50));

    // Mathematical linear mapping to arc
    const xScale = d3.scaleLinear()
        .domain([-0.5, 0.5])
        .range([-R, R])
        .clamp(true);

    // 1. Render Base Geometry (Baseline, Arc, Neutral Guide, Pivot Hub, Pole Labels)
    gProjectionBase.selectAll("*").remove();

    // Semicircular arc path (from left to right clockwise through upper half)
    const arcPathString = `M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`;
    gProjectionBase.append("path")
        .attr("class", "arc-path")
        .attr("d", arcPathString);

    // Baseline (thick consensus axis)
    gProjectionBase.append("line")
        .attr("class", "arc-axis-line")
        .attr("x1", cx - R - 10)
        .attr("y1", cy)
        .attr("x2", cx + R + 10)
        .attr("y2", cy);

    // Neutral vertical dashed line (at 0.0)
    gProjectionBase.append("line")
        .attr("class", "arc-neutral-line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx)
        .attr("y2", cy - R);

    // Neutral center tick mark on baseline
    gProjectionBase.append("line")
        .attr("class", "arc-neutral-line")
        .attr("x1", cx)
        .attr("y1", cy - 6)
        .attr("x2", cx)
        .attr("y2", cy + 6)
        .attr("stroke", "var(--color-text-main)");

    // Pivot center hub circle
    gProjectionBase.append("circle")
        .attr("class", "arc-center-hub")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 5.5);

    // Pole labels & neutral label
    gProjectionBase.append("text")
        .attr("class", "arc-pole-label")
        .attr("x", cx - R)
        .attr("y", cy + 24)
        .attr("text-anchor", "start")
        .text(`← ${poleNeg} (-0.50)`);

    gProjectionBase.append("text")
        .attr("class", "arc-neutral-label")
        .attr("x", cx)
        .attr("y", cy + 24)
        .attr("text-anchor", "middle")
        .text(`0.0 (Neutro)`);

    gProjectionBase.append("text")
        .attr("class", "arc-pole-label")
        .attr("x", cx + R)
        .attr("y", cy + 24)
        .attr("text-anchor", "end")
        .text(`${polePos} (+0.50) →`);

    // 2. Prepare Country Geometry Data
    const countryPoints = items.map(d => {
        const normKey = d.country.toLowerCase();
        const meta = countryMetadata[normKey] || {
            code: d.country.slice(0, 2).toUpperCase(),
            name: d.country,
            color: "#666",
            hex: "#666"
        };
        const val = d.projection;
        const dx = xScale(val);
        const dy = -Math.sqrt(Math.max(0, R * R - dx * dx));
        return {
            id: d.country,
            country: d.country,
            name: meta.name,
            code: meta.code,
            color: meta.color,
            hex: meta.hex,
            value: val,
            poles: d.poles,
            poleNeg,
            polePos,
            word,
            dimension,
            xArc: cx + dx,
            yArc: cy + dy,
            xBase: cx + dx,
            yBase: cy
        };
    });

    const t = d3.transition().duration(800).ease(d3.easeCubicOut);

    // 3. Dotted Perpendicular Projection Lines
    gProjectionLines.selectAll(".arc-proj-line")
        .data(countryPoints, d => d.id)
        .join(
            enter => enter.append("line")
                .attr("class", "arc-proj-line")
                .attr("x1", d => d.xArc)
                .attr("y1", d => d.yArc)
                .attr("x2", d => d.xBase)
                .attr("y2", d => d.yBase)
                .attr("stroke", d => d.color),
            update => update.call(u => u.transition(t)
                .attr("x1", d => d.xArc)
                .attr("y1", d => d.yArc)
                .attr("x2", d => d.xBase)
                .attr("y2", d => d.yBase)
                .attr("stroke", d => d.color)),
            exit => exit.transition(t).style("opacity", 0).remove()
        );

    // 4. Solid Needle Vectors
    gProjectionNeedles.selectAll(".arc-vector")
        .data(countryPoints, d => d.id)
        .join(
            enter => enter.append("line")
                .attr("class", "arc-vector")
                .attr("x1", cx)
                .attr("y1", cy)
                .attr("x2", d => d.xArc)
                .attr("y2", d => d.yArc)
                .attr("stroke", d => d.color)
                .on("mouseover", handleArcItemMouseOver)
                .on("mousemove", positionTooltip)
                .on("mouseleave", handleArcItemMouseLeave),
            update => update.call(u => u.transition(t)
                .attr("x1", cx)
                .attr("y1", cy)
                .attr("x2", d => d.xArc)
                .attr("y2", d => d.yArc)
                .attr("stroke", d => d.color)),
            exit => exit.transition(t).style("opacity", 0).remove()
        );

    // 5. Markers on Baseline
    gProjectionMarkers.selectAll(".arc-proj-marker")
        .data(countryPoints, d => d.id)
        .join(
            enter => enter.append("circle")
                .attr("class", "arc-proj-marker")
                .attr("cx", d => d.xBase)
                .attr("cy", d => d.yBase)
                .attr("r", 5)
                .attr("fill", d => d.color)
                .on("mouseover", handleArcItemMouseOver)
                .on("mousemove", positionTooltip)
                .on("mouseleave", handleArcItemMouseLeave),
            update => update.call(u => u.transition(t)
                .attr("cx", d => d.xBase)
                .attr("cy", d => d.yBase)
                .attr("fill", d => d.color)),
            exit => exit.transition(t).style("opacity", 0).remove()
        );

    // 6. Arc Tip Nodes
    gProjectionNodes.selectAll(".arc-node")
        .data(countryPoints, d => d.id)
        .join(
            enter => enter.append("circle")
                .attr("class", "arc-node")
                .attr("cx", d => d.xArc)
                .attr("cy", d => d.yArc)
                .attr("r", 9.5)
                .attr("fill", d => d.color)
                .on("mouseover", handleArcItemMouseOver)
                .on("mousemove", positionTooltip)
                .on("mouseleave", handleArcItemMouseLeave),
            update => update.call(u => u.transition(t)
                .attr("cx", d => d.xArc)
                .attr("cy", d => d.yArc)
                .attr("fill", d => d.color)),
            exit => exit.transition(t).style("opacity", 0).remove()
        );

    // 7. Node Country Code Labels above Arc
    gProjectionLabels.selectAll(".arc-node-label-group")
        .data(countryPoints, d => d.id)
        .join(
            enter => {
                const g = enter.append("g")
                    .attr("class", "arc-node-label-group")
                    .attr("transform", d => `translate(${d.xArc}, ${d.yArc - 17})`);
                g.append("rect")
                    .attr("class", "arc-node-bg")
                    .attr("x", -15)
                    .attr("y", -8)
                    .attr("width", 30)
                    .attr("height", 16);
                g.append("text")
                    .attr("class", "arc-node-text")
                    .attr("fill", d => d.color)
                    .text(d => d.code);
                return g;
            },
            update => {
                update.transition(t)
                    .attr("transform", d => `translate(${d.xArc}, ${d.yArc - 17})`);
                update.select(".arc-node-text")
                    .attr("fill", d => d.color)
                    .text(d => d.code);
                return update;
            },
            exit => exit.transition(t).style("opacity", 0).remove()
        );

    // 8. Update UI Badges & Storytelling Insight Cards
    updateProjectionBadgesAndCards(dimension, word, countryPoints, poleNeg, polePos);
}

/**
 * Projection Arc Tooltip Handlers
 */
function handleArcItemMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.98);
    const sign = d.value >= 0 ? "+" : "";
    const poleOrientation = d.value < 0 ? d.poleNeg : (d.value > 0 ? d.polePos : "Neutro");
    const diffPct = Math.abs(d.value / 0.5 * 100).toFixed(1);

    tooltip.html(`
        <div class="tooltip-title" style="color:${d.color}">${d.name} (${d.code})</div>
        <div style="font-size:0.85rem; margin: 0.25rem 0; font-weight:700;">Palabra: &ldquo;${d.word}&rdquo;</div>
        <div class="tooltip-row" style="margin-top:0.25rem;">
            <span>Proyección:</span>
            <strong style="color:${d.color}">${sign}${d.value.toFixed(3)}</strong>
        </div>
        <div class="tooltip-row" style="margin-top:0.2rem;">
            <span>Polo dominante:</span>
            <strong>${poleOrientation}</strong>
        </div>
        <div class="tooltip-row" style="margin-top:0.2rem; font-size:0.75rem; color:#b5b0aa;">
            <span>Intensidad: ${diffPct}% hacia el extremo</span>
        </div>
    `);
    positionTooltip(event);
}

function handleArcItemMouseLeave() {
    tooltip.transition().duration(150).style("opacity", 0);
}

/**
 * Updates status bar badges & country cards below projection canvas
 */
function updateProjectionBadgesAndCards(dimKey, word, points, poleNeg, polePos) {
    const dim = dimensionInfo[dimKey] || { label: dimKey };

    const activeBadge = document.getElementById("projection-active-badge");
    if (activeBadge) {
        activeBadge.innerHTML = `Palabra: <strong>${word}</strong>`;
    }

    const dimBadge = document.getElementById("projection-dim-badge");
    if (dimBadge) {
        dimBadge.innerText = `Dimensión: ${dim.label}`;
    }

    const polesBadge = document.getElementById("projection-poles-badge");
    if (polesBadge) {
        polesBadge.innerText = `${poleNeg} ← Neutro (0.0) → ${polePos}`;
    }

    const cardsContainer = document.getElementById("storytelling-insights-projection");
    if (cardsContainer) {
        const cardsHtml = points.map(d => {
            const sign = d.value >= 0 ? "+" : "";
            const poleTarget = d.value < 0 ? poleNeg : (d.value > 0 ? polePos : "Neutro");
            return `
                <div class="insight-card country-border-${d.code.toLowerCase()}" 
                     data-country="${d.id}"
                     title="Ver proyección de ${d.name}">
                    <div class="insight-country" style="color:${d.color}">${d.name}</div>
                    <div class="insight-stat" style="color:${d.color}">${sign}${d.value.toFixed(3)}</div>
                    <div class="insight-label">${poleTarget}</div>
                </div>
            `;
        }).join("");

        cardsContainer.innerHTML = `<div class="insights-grid">${cardsHtml}</div>`;

        // Highlight needle/marker when hovering card
        cardsContainer.querySelectorAll(".insight-card").forEach(card => {
            const cId = card.getAttribute("data-country");
            card.addEventListener("mouseenter", () => {
                gProjectionNeedles.selectAll(".arc-vector")
                    .transition().duration(150)
                    .attr("stroke-width", d => d.id === cId ? 6 : 1.5)
                    .style("opacity", d => d.id === cId ? 1 : 0.35);
                gProjectionNodes.selectAll(".arc-node")
                    .transition().duration(150)
                    .attr("r", d => d.id === cId ? 13 : 7);
            });
            card.addEventListener("mouseleave", () => {
                gProjectionNeedles.selectAll(".arc-vector")
                    .transition().duration(150)
                    .attr("stroke-width", 3.5)
                    .style("opacity", 1);
                gProjectionNodes.selectAll(".arc-node")
                    .transition().duration(150)
                    .attr("r", 9.5);
            });
        });
    }
}

/**
 * Setup interactive UI for Step 5: Dimension buttons & Word pills
 */
function setupProjectionInteractiveUI() {
    const dimContainer = document.getElementById("projection-dim-filters");
    const wordContainer = document.getElementById("projection-word-pills");
    if (!dimContainer || !wordContainer || !rawProjectionData) return;

    dimContainer.innerHTML = "";

    // 1. Create Dimension Buttons
    projectionDimensions.forEach(dim => {
        const btn = document.createElement("button");
        btn.className = `filter-btn ${dim.key === interactiveProjectionDim ? "filter-btn-active active" : ""}`;
        btn.setAttribute("data-dim", dim.key);
        btn.innerHTML = `<span>${dim.icon}</span> <span>${dim.label}</span>`;

        btn.addEventListener("click", () => {
            dimContainer.querySelectorAll(".filter-btn").forEach(b => {
                b.classList.remove("filter-btn-active", "active");
            });
            btn.classList.add("filter-btn-active", "active");
            interactiveProjectionDim = dim.key;

            // Re-populate words for this dimension
            populateWordPills(dim.key);

            // Select first word or keep current
            const words = Object.keys(rawProjectionData[dim.key] || {});
            if (!words.includes(interactiveProjectionWord)) {
                interactiveProjectionWord = words[0] || "manifestante";
            }
            updateActiveWordPill();
            renderArc(interactiveProjectionDim, interactiveProjectionWord);
        });

        dimContainer.appendChild(btn);
    });

    // 2. Populate Word Pills for Initial Dimension
    populateWordPills(interactiveProjectionDim);
}

function populateWordPills(dimKey) {
    const wordContainer = document.getElementById("projection-word-pills");
    if (!wordContainer || !rawProjectionData || !rawProjectionData[dimKey]) return;

    wordContainer.innerHTML = "";
    const words = Object.keys(rawProjectionData[dimKey]);

    words.forEach(word => {
        const btn = document.createElement("button");
        btn.className = `action-btn ${word === interactiveProjectionWord ? "action-btn-active active" : ""}`;
        btn.setAttribute("data-word", word);
        btn.textContent = word;

        btn.addEventListener("click", () => {
            wordContainer.querySelectorAll(".action-btn").forEach(b => {
                b.classList.remove("action-btn-active", "active");
            });
            btn.classList.add("action-btn-active", "active");
            interactiveProjectionWord = word;
            renderArc(interactiveProjectionDim, interactiveProjectionWord);
        });

        wordContainer.appendChild(btn);
    });
}

function updateActiveWordPill() {
    const wordContainer = document.getElementById("projection-word-pills");
    if (!wordContainer) return;
    wordContainer.querySelectorAll(".action-btn").forEach(btn => {
        const w = btn.getAttribute("data-word");
        btn.classList.toggle("action-btn-active", w === interactiveProjectionWord);
        btn.classList.toggle("active", w === interactiveProjectionWord);
    });
}

/**
 * Initialize Scrollama for Section 2 (Arco de Proyección 1D)
 */
function initScrollamaProjection() {
    scrollerProjection
        .setup({
            step: "#scrolly-projection article .step",
            offset: 0.52,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const stepEl = response.element;

            document.querySelectorAll("#scrolly-projection article .step")
                .forEach((el, idx) => el.classList.toggle("is-active", idx === stepIndex));

            const stepNum = parseInt(stepEl.getAttribute("data-step"), 10);
            const uiContainer = document.getElementById("projection-interactive-ui");

            if (stepNum === 1) {
                if (uiContainer) uiContainer.classList.remove("is-visible");
                renderArc("moral", "manifestante");
            } else if (stepNum === 2) {
                if (uiContainer) uiContainer.classList.remove("is-visible");
                renderArc("moral", "carabineros");
            } else if (stepNum === 3) {
                if (uiContainer) uiContainer.classList.remove("is-visible");
                renderArc("nationalism", "inmigrante");
            } else if (stepNum === 4) {
                if (uiContainer) uiContainer.classList.remove("is-visible");
                renderArc("gender", "enfermería");
            } else if (stepNum === 5) {
                if (uiContainer) uiContainer.classList.add("is-visible");
                renderArc(interactiveProjectionDim, interactiveProjectionWord);
            }
        });
}

/**
 * Window resize handler
 */
function handleResize() {
    // 1. Constellation resize
    const canvasConstellation = document.getElementById("d3-canvas-constellation");
    if (canvasConstellation && svgConstellation) {
        widthConstellation = canvasConstellation.clientWidth || 800;
        heightConstellation = canvasConstellation.clientHeight || 560;

        svgConstellation
            .attr("width", widthConstellation)
            .attr("height", heightConstellation)
            .attr("viewBox", `0 0 ${widthConstellation} ${heightConstellation}`);

        if (simulation) {
            simulation.force("center", d3.forceCenter(widthConstellation / 2, heightConstellation / 2));
            simulation.force("x", d3.forceX(widthConstellation / 2).strength(0.09));
            simulation.force("y", d3.forceY(heightConstellation / 2).strength(0.09));
            simulation.force("link")
                .distance(d => getTargetLinkDistance(d.value, widthConstellation, heightConstellation));
            simulation.alpha(0.6).restart();
        }

        scrollerConstellation.resize();
    }

    // 2. Projection Arc resize
    const canvasProjection = document.getElementById("d3-canvas-projection");
    if (canvasProjection && svgProjection && rawProjectionData) {
        renderArc(currentProjectionDim, currentProjectionWord);
        scrollerProjection.resize();
    }
}

/**
 * Main bootstrapper for Volumen II
 */
function initVolumen2() {
    setupTooltip();

    Promise.all([
        d3.json("./data/embeddings/similarity_matrices_per_cultural_dimensions_between_countries.json"),
        d3.json("./data/embeddings/proyecciones_optimizadas.json")
    ])
    .then(([similarityData, projectionData]) => {
        // Init Section 1: Constellation
        rawSimilarityData = similarityData;
        setupD3ConstellationCanvas();
        setupInteractiveFilterButtons();
        initScrollama();

        // Init Section 2: Projection Arc
        rawProjectionData = projectionData;
        setupD3ProjectionCanvas();
        setupProjectionInteractiveUI();
        initScrollamaProjection();

        // Initial render for Section 2
        renderArc("moral", "manifestante");

        window.addEventListener("resize", handleResize);
        console.log("[Volumen II] Constellation Graph & Projection Arc initialized successfully.");
    })
    .catch(err => {
        console.error("[Volumen II Error] Failed to load dataset:", err);
    });
}

// Launch on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVolumen2);
} else {
    initVolumen2();
}
