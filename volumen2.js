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
    "mexico": {
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

/**
 * Window resize handler
 */
function handleResize() {
    const canvas = document.getElementById("d3-canvas-constellation");
    if (!canvas || !svgConstellation) return;

    widthConstellation = canvas.clientWidth || 800;
    heightConstellation = canvas.clientHeight || 560;

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

/**
 * Main bootstrapper for Volumen II
 */
function initVolumen2() {
    setupTooltip();

    d3.json("./data/embeddings/similarity_matrices_per_cultural_dimensions_between_countries.json")
        .then(data => {
            rawSimilarityData = data;
            setupD3ConstellationCanvas();
            setupInteractiveFilterButtons();
            initScrollama();

            window.addEventListener("resize", handleResize);
            console.log("[Volumen II] Constellation Graph initialized successfully.");
        })
        .catch(err => {
            console.error("[Volumen II Error] Failed to load similarity data:", err);
        });
}

// Launch on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVolumen2);
} else {
    initVolumen2();
}
