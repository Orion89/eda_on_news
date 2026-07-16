/**
 * El Eco de las Palabras: Radiografía del Periodismo en Hispanoamérica
 * main.js - D3 Scrollytelling Visualizations (Bubble, Scatter, Stacked Bar & Ridgeline)
 */

// Initialize scrollama instances for all sections
const scroller = scrollama();
const scrollerStyle = scrollama();
const scrollerPos = scrollama();
const scrollerEmotions = scrollama();
const scrollerMap = scrollama();
const scrollerBeeswarm = scrollama();
const scrollerSankey = scrollama();

// --- Globals for Section 1 (Bubble Chart) ---
let svg;
let simulation;
let width = 800;
let height = 600;
let rawNodes = [];
let collapsedNodes = [];
let radiusScale;
let tooltip;

let countryCenters = {
    "AR": { x: 0, y: 0 },
    "CL": { x: 0, y: 0 },
    "ES": { x: 0, y: 0 },
    "MX": { x: 0, y: 0 }
};

// --- Globals for Section 2 (Scatter Plot) ---
let svgStyle;
let widthStyle = 800;
let heightStyle = 600;
let allStyleData = [];
let xScaleStyle, yScaleStyle;
let globalMedianTTR = 0;
let globalMedianSentLen = 0;
let analyticMedia = null;
let directMedia = null;
let selectedStyleCountry = "all";

const paddingStyle = { top: 50, right: 40, bottom: 60, left: 65 };

// --- Globals for Section 3 (100% Stacked Bar Chart) ---
let svgPos;
let widthPos = 800;
let heightPos = 600;
let allPosData = [];
let xScalePos, yScalePos;
let selectedPosCountry = "AR";
let isSortedBySubjectivity = false;
let posCountryAverages = {};
let maxAdjectiveMedia = null;
let maxAdjectiveCountry = "";

const paddingPos = { top: 30, right: 30, bottom: 40, left: 145 };

// --- Globals for Section 5 (Ridgeline Joyplot) ---
let svgEmotions;
let widthEmotions = 800;
let heightEmotions = 600;
let allEmotionsRawData = [];
let allEmotionsAggregatedData = [];
let xScaleEmotions, yScaleIntensityEmotions;
let selectedEmotion = "alegría";
let emotionsStorytellingData = {};

const paddingEmotions = { top: 50, right: 30, bottom: 50, left: 100 };

// --- Globals for Section 6 (NER Map) ---
let svgMap;
let gMap;
let widthMap = 800;
let heightMap = 600;
let allMapData = [];
let mapStorytellingData = {};
let projectionMap, pathGeneratorMap, zoomBehaviorMap;
let worldGeoData;
let selectedMapCountry = "all";
let mapCycleInterval = null;

const countryCentersMap = {
    "all": { center: [-45, -5], zoom: 1.35 },
    "CL": { center: [-71.5, -35], zoom: 4.8 },
    "AR": { center: [-65, -38], zoom: 3.5 },
    "MX": { center: [-102, 23], zoom: 3.6 },
    "ES": { center: [-3.7, 40], zoom: 5.2 }
};

// Map country codes to readable names
const countryNames = {
    "AR": "Argentina",
    "CL": "Chile",
    "ES": "España",
    "MX": "México"
};

// --- Globals for Section 7 (Beeswarm Plot) ---
let svgBeeswarm;
let widthBeeswarm = 800;
let heightBeeswarm = 600;
let allBeeswarmData = [];
let beeswarmMedianByCountry = {};
let beeswarmStorytellingData = {};
let yScaleBeeswarm;

const paddingBeeswarm = { top: 55, right: 50, bottom: 55, left: 68 };

// --- Globals for Section 8 (Sankey) ---
let svgSankey;
let widthSankey = 800;
let heightSankey = 600;
let allSankeyData = {};
let selectedSankeyCountry = "AR";


// Map country names from dataset to standard country codes
const countryMappingEmotions = {
    "argentina": "AR",
    "chile": "CL",
    "espana": "ES",
    "mexico": "MX"
};

/**
 * Accessor for node colors in Section 1 (Bubble Chart)
 */
function getNodeColor(d) {
    if (d.isOthers) return "#b5b0aa";
    switch (d.country) {
        case "AR": return "var(--color-ar)";
        case "CL": return "var(--color-cl)";
        case "ES": return "var(--color-es)";
        case "MX": return "var(--color-mx)";
        default: return "#999";
    }
}

/**
 * Accessor for node colors in Section 2 (Scatter Plot)
 */
function getStyleColor(d) {
    switch (d.country) {
        case "AR": return "var(--color-ar)";
        case "CL": return "var(--color-cl)";
        case "ES": return "var(--color-es)";
        case "MX": return "var(--color-mx)";
        default: return "#999";
    }
}

// ==========================================
// SECTION 1: BUBBLE CHART (Concentration)
// ==========================================

/**
 * Dynamic storytelling text generator for Section 1.
 */
function generateStorytellingText(datasets) {
    const container = document.getElementById("storytelling-insights");
    if (!container) return;

    let html = '<div class="insights-grid">';

    Object.keys(datasets).forEach(country => {
        const data = datasets[country];
        data.sort((a, b) => b.count - a.count);

        const totalMedios = data.length;
        const totalNoticias = d3.sum(data, d => d.count);

        let runningSum = 0;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
            runningSum += data[i].count;
            x++;
            if (runningSum / totalNoticias >= 0.8) {
                break;
            }
        }

        const medioTop = data[0].media_name_normalized;
        const countryName = countryNames[country];
        const topPercentage = data[0].percentage;

        html += `
            <div class="insight-card country-border-${country.toLowerCase()}">
                <h4 class="insight-country">${countryName}</h4>
                <p class="insight-text">
                    En <strong>${countryName}</strong>, el ecosistema parece plural con <strong>${totalMedios}</strong> medios, pero apenas <strong>${x}</strong> medios concentran el 80% de la información. El gigante indiscutido es <strong>${medioTop}</strong>.
                </p>
                <div class="insight-meta">
                    Noticias totales: ${totalNoticias.toLocaleString()} | Domina: <strong>${medioTop}</strong> con ${topPercentage.toFixed(1)}%
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Loads CSV files for Section 1.
 */
function loadData() {
    return Promise.all([
        d3.csv("data/per_media_statistics/news_argentina_media_statistics.csv"),
        d3.csv("data/per_media_statistics/news_chile_media_statistics.csv"),
        d3.csv("data/per_media_statistics/news_espana_media_statistics.csv"),
        d3.csv("data/per_media_statistics/news_mexico_media_statistics.csv")
    ]).then(([arData, clData, esData, mxData]) => {
        arData.forEach(d => d.country = "AR");
        clData.forEach(d => d.country = "CL");
        esData.forEach(d => d.country = "ES");
        mxData.forEach(d => d.country = "MX");

        const datasets = {
            "AR": arData,
            "CL": clData,
            "ES": esData,
            "MX": mxData
        };

        const allRawData = [...arData, ...clData, ...esData, ...mxData];

        allRawData.forEach(d => {
            d.count = +d.count;
            d.percentage = +d.percentage;
            d.percentage_cum_sum = +d.percentage_cum_sum;
        });

        rawNodes = allRawData.map(d => ({
            id: `${d.country}_${d.media_name_normalized}`,
            country: d.country,
            name: d.media_name_normalized,
            count: d.count,
            percentage: d.percentage,
            isOthers: false
        }));

        collapsedNodes = [];
        Object.keys(datasets).forEach(country => {
            const countryData = datasets[country];
            const keep = [];
            const collapse = [];

            countryData.forEach(d => {
                if (d.count >= 100) {
                    keep.push(d);
                } else {
                    collapse.push(d);
                }
            });

            keep.forEach(d => {
                collapsedNodes.push({
                    id: `${d.country}_${d.media_name_normalized}`,
                    country: d.country,
                    name: d.media_name_normalized,
                    count: d.count,
                    percentage: d.percentage,
                    isOthers: false
                });
            });

            if (collapse.length > 0) {
                const totalCollapsedCount = d3.sum(collapse, d => d.count);
                const totalCollapsedPercentage = d3.sum(collapse, d => d.percentage);
                collapsedNodes.push({
                    id: `${country}_Otros`,
                    country: country,
                    name: "Otros",
                    count: totalCollapsedCount,
                    percentage: totalCollapsedPercentage,
                    isOthers: true
                });
            }
        });

        const maxCount = d3.max([...rawNodes, ...collapsedNodes], d => d.count);

        radiusScale = d3.scaleSqrt()
            .domain([1, maxCount])
            .range([3, 42]);

        rawNodes.forEach(d => d.radius = radiusScale(d.count));
        collapsedNodes.forEach(d => d.radius = radiusScale(d.count));

        generateStorytellingText(datasets);
    });
}

function updateCenters() {
    if (width > 600) {
        countryCenters = {
            "AR": { x: width * 0.28, y: height * 0.32 },
            "CL": { x: width * 0.72, y: height * 0.32 },
            "ES": { x: width * 0.28, y: height * 0.68 },
            "MX": { x: width * 0.72, y: height * 0.68 }
        };
    } else {
        countryCenters = {
            "AR": { x: width * 0.28, y: height * 0.26 },
            "CL": { x: width * 0.72, y: height * 0.26 },
            "ES": { x: width * 0.28, y: height * 0.74 },
            "MX": { x: width * 0.72, y: height * 0.74 }
        };
    }
}

function drawLabels(bgLayer, fgLayer) {
    const countriesList = [
        { code: "AR", name: "Argentina" },
        { code: "CL", name: "Chile" },
        { code: "ES", name: "España" },
        { code: "MX", name: "México" }
    ];

    bgLayer.selectAll(".bg-country-label")
        .data(countriesList, d => d.code)
        .join("text")
        .attr("class", "bg-country-label")
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--font-heading)")
        .attr("font-size", "min(6.5vw, 4rem)")
        .attr("fill", "var(--color-text-main)")
        .attr("opacity", 0.05)
        .text(d => d.name.toUpperCase())
        .attr("x", d => countryCenters[d.code].x)
        .attr("y", d => countryCenters[d.code].y + 15);

    fgLayer.selectAll(".country-label")
        .data(countriesList, d => d.code)
        .join("text")
        .attr("class", "country-label")
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--font-sans)")
        .attr("font-size", "0.75rem")
        .attr("font-weight", "700")
        .attr("letter-spacing", "0.12em")
        .attr("text-transform", "uppercase")
        .attr("fill", "var(--color-text-muted)")
        .text(d => d.name)
        .attr("x", d => countryCenters[d.code].x)
        .attr("y", d => countryCenters[d.code].y - 85);
}

function setupD3Canvas() {
    const canvas = document.getElementById("d3-canvas");
    if (!canvas) return;

    canvas.innerHTML = "";
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    svg = d3.select(canvas)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const bgLayer = svg.append("g").attr("class", "background-labels-layer");
    svg.append("g").attr("class", "nodes-layer");
    const fgLayer = svg.append("g").attr("class", "foreground-labels-layer");

    updateCenters();
    drawLabels(bgLayer, fgLayer);
    setupTooltip();

    simulation = d3.forceSimulation()
        .force("x", d3.forceX(d => countryCenters[d.country].x).strength(0.18))
        .force("y", d3.forceY(d => countryCenters[d.country].y).strength(0.18))
        .force("collide", d3.forceCollide(d => d.radius + 1.2).iterations(2))
        .force("charge", d3.forceManyBody().strength(-1.5))
        .on("tick", ticked);
}

function ticked() {
    svg.selectAll(".bubble")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

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

function handleMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    
    let titleText = d.name;
    let subtitleHtml = "";
    
    if (d.isOthers) {
        titleText = "Otros Medios";
        subtitleHtml = `<div class="tooltip-row" style="color:#b5b0aa; font-size:0.75rem;"><em>Medios agrupados con &lt; 100 noticias</em></div>`;
    }

    tooltip.html(`
        <div class="tooltip-title">${titleText}</div>
        ${subtitleHtml}
        <div class="tooltip-row"><strong>País:</strong> ${countryNames[d.country]}</div>
        <div class="tooltip-row"><strong>Noticias:</strong> ${d.count.toLocaleString()}</div>
        <div class="tooltip-row"><strong>Porcentaje:</strong> ${d.percentage.toFixed(2)}%</div>
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function handleMouseMove(event) {
    tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function handleMouseLeave() {
    tooltip.transition().duration(100).style("opacity", 0);
}

function updateVisualization(stepIndex) {
    if (!svg || !simulation) return;

    let targetNodes;
    if (stepIndex === 0) {
        targetNodes = JSON.parse(JSON.stringify(rawNodes));
    } else {
        targetNodes = JSON.parse(JSON.stringify(collapsedNodes));
    }

    const activeNodesMap = new Map();
    simulation.nodes().forEach(node => {
        activeNodesMap.set(node.id, { x: node.x, y: node.y, vx: node.vx, vy: node.vy });
    });

    targetNodes.forEach(node => {
        if (activeNodesMap.has(node.id)) {
            const cached = activeNodesMap.get(node.id);
            node.x = cached.x;
            node.y = cached.y;
            node.vx = cached.vx;
            node.vy = cached.vy;
        } else {
            node.x = countryCenters[node.country].x + (Math.random() - 0.5) * 15;
            node.y = countryCenters[node.country].y + (Math.random() - 0.5) * 15;
        }
    });

    simulation.nodes(targetNodes);
    simulation.force("x", d3.forceX(d => countryCenters[d.country].x).strength(0.18))
        .force("y", d3.forceY(d => countryCenters[d.country].y).strength(0.18))
        .force("collide", d3.forceCollide(d => d.radius + 1.2).iterations(2));
    simulation.alpha(0.85).restart();

    const bubbleSelection = svg.select(".nodes-layer")
        .selectAll(".bubble")
        .data(targetNodes, d => d.id);

    bubbleSelection.enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("fill", d => getNodeColor(d))
        .attr("cx", d => countryCenters[d.country].x)
        .attr("cy", d => countryCenters[d.country].y)
        .attr("r", 0)
        .style("opacity", 0)
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave)
        .transition()
        .duration(600)
        .attr("r", d => d.radius)
        .style("opacity", 1);

    bubbleSelection
        .transition()
        .duration(600)
        .attr("fill", d => getNodeColor(d))
        .attr("r", d => d.radius);

    bubbleSelection.exit()
        .transition()
        .duration(400)
        .attr("r", 0)
        .style("opacity", 0)
        .remove();
}

// ==========================================
// SECTION 2: SCATTER PLOT (Stylistics)
// ==========================================

/**
 * Dynamic storytelling text generator for Section 2 (Style).
 */
function generateStyleStorytellingText() {
    const container = document.getElementById("storytelling-insights-style");
    if (!container) return;

    const ttrExtent = d3.extent(allStyleData, d => d.ttr);
    const sentLenExtent = d3.extent(allStyleData, d => d.sentLen);

    allStyleData.forEach(d => {
        d.xNorm = (d.ttr - ttrExtent[0]) / (ttrExtent[1] - ttrExtent[0]);
        d.yNorm = (d.sentLen - sentLenExtent[0]) / (sentLenExtent[1] - sentLenExtent[0]);
        d.score = d.xNorm + d.yNorm;
    });

    const analyticalCandidates = allStyleData.filter(d => d.ttr > globalMedianTTR && d.sentLen > globalMedianSentLen);
    const directCandidates = allStyleData.filter(d => d.ttr < globalMedianTTR && d.sentLen < globalMedianSentLen);

    analyticMedia = analyticalCandidates.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr, analyticalCandidates[0]);
    directMedia = directCandidates.reduce((prev, curr) => (prev.score < curr.score) ? prev : curr, directCandidates[0]);

    if (!analyticMedia || !directMedia) return;

    container.innerHTML = `
        <p>
            El estilo de escritura varía drásticamente. Mientras <strong>${analyticMedia.media_name_normalized}</strong> 
            (de ${countryNames[analyticMedia.country]}) exige alta concentración con oraciones de promedio 
            <strong>${analyticMedia.sentLen.toFixed(1)}</strong> palabras y vocabulario rico, medios como 
            <strong>${directMedia.media_name_normalized}</strong> (de ${countryNames[directMedia.country]}) 
            apuestan por la inmediatez y el consumo rápido.
        </p>
    `;
}

/**
 * Loads CSV files for Section 2.
 */
function loadStyleData() {
    return Promise.all([
        d3.csv("data/linguistic_characteristics/per_country_and_media_name/news_argentina_features_per_media.csv"),
        d3.csv("data/linguistic_characteristics/per_country_and_media_name/news_chile_features_per_media.csv"),
        d3.csv("data/linguistic_characteristics/per_country_and_media_name/news_espana_features_per_media.csv"),
        d3.csv("data/linguistic_characteristics/per_country_and_media_name/news_mexico_features_per_media.csv")
    ]).then(([arData, clData, esData, mxData]) => {
        arData.forEach(d => d.country = "AR");
        clData.forEach(d => d.country = "CL");
        esData.forEach(d => d.country = "ES");
        mxData.forEach(d => d.country = "MX");

        allStyleData = [...arData, ...clData, ...esData, ...mxData];

        allStyleData.forEach(d => {
            d.ttr = +(d.type_token_ratio || d.mean_ttr);
            d.sentLen = +(d.avg_sentence_len || d.mean_sent_len);
            d.id = `${d.country}_${d.media_name_normalized}`;
        });

        globalMedianTTR = d3.median(allStyleData, d => d.ttr);
        globalMedianSentLen = d3.median(allStyleData, d => d.sentLen);

        generateStyleStorytellingText();
    });
}

function handleStyleMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    tooltip.html(`
        <div class="tooltip-title">${d.media_name_normalized}</div>
        <div class="tooltip-row"><strong>País:</strong> ${countryNames[d.country]}</div>
        <div class="tooltip-row"><strong>Riqueza Léxica (TTR):</strong> ${d.ttr.toFixed(3)}</div>
        <div class="tooltip-row"><strong>Longitud Oración:</strong> ${d.sentLen.toFixed(1)} palabras</div>
        <div class="tooltip-row" style="font-size:0.75rem; color:#b5b0aa; margin-top:0.4rem;">
            Artículos analizados: ${parseInt(d.num_samples).toLocaleString()}
        </div>
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

/**
 * Draw/Redraw D3 Scatter Plot structure.
 */
function setupD3StyleCanvas() {
    const canvas = document.getElementById("d3-canvas-style");
    if (!canvas) return;

    canvas.innerHTML = "";
    widthStyle = canvas.clientWidth;
    heightStyle = canvas.clientHeight;

    svgStyle = d3.select(canvas)
        .append("svg")
        .attr("width", widthStyle)
        .attr("height", heightStyle)
        .attr("viewBox", `0 0 ${widthStyle} ${heightStyle}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const ttrExtent = d3.extent(allStyleData, d => d.ttr);
    const sentLenExtent = d3.extent(allStyleData, d => d.sentLen);

    const ttrPadding = (ttrExtent[1] - ttrExtent[0]) * 0.06;
    const sentLenPadding = (sentLenExtent[1] - sentLenExtent[0]) * 0.06;

    xScaleStyle = d3.scaleLinear()
        .domain([ttrExtent[0] - ttrPadding, ttrExtent[1] + ttrPadding])
        .range([paddingStyle.left, widthStyle - paddingStyle.right]);

    yScaleStyle = d3.scaleLinear()
        .domain([sentLenExtent[0] - sentLenPadding, sentLenExtent[1] + sentLenPadding])
        .range([heightStyle - paddingStyle.bottom, paddingStyle.top]);

    svgStyle.append("g").attr("class", "quadrants-layer");
    svgStyle.append("g").attr("class", "x-axis axis");
    svgStyle.append("g").attr("class", "y-axis axis");
    svgStyle.append("g").attr("class", "dots-layer");
    svgStyle.append("g").attr("class", "labels-layer");

    drawStyleGrid();
    renderStylePlot();
}

function drawStyleGrid() {
    const qGroup = svgStyle.select(".quadrants-layer");
    const lGroup = svgStyle.select(".labels-layer");
    qGroup.selectAll("*").remove();
    lGroup.selectAll("*").remove();

    svgStyle.select(".x-axis")
        .attr("transform", `translate(0, ${heightStyle - paddingStyle.bottom})`)
        .call(d3.axisBottom(xScaleStyle).ticks(5).tickFormat(d3.format(".2f")));

    svgStyle.select(".y-axis")
        .attr("transform", `translate(${paddingStyle.left}, 0)`)
        .call(d3.axisLeft(yScaleStyle).ticks(5));

    svgStyle.select(".x-axis-label").remove();
    svgStyle.append("text")
        .attr("class", "axis-label x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", paddingStyle.left + (widthStyle - paddingStyle.left - paddingStyle.right) / 2)
        .attr("y", heightStyle - 15)
        .text("Riqueza Léxica (TTR)");

    svgStyle.select(".y-axis-label").remove();
    svgStyle.append("text")
        .attr("class", "axis-label y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -(paddingStyle.top + (heightStyle - paddingStyle.top - paddingStyle.bottom) / 2))
        .attr("y", 20)
        .text("Longitud de Oración Promedio (palabras)");

    qGroup.append("line")
        .attr("class", "quadrant-line")
        .attr("x1", paddingStyle.left)
        .attr("y1", yScaleStyle(globalMedianSentLen))
        .attr("x2", widthStyle - paddingStyle.right)
        .attr("y2", yScaleStyle(globalMedianSentLen));

    qGroup.append("line")
        .attr("class", "quadrant-line")
        .attr("x1", xScaleStyle(globalMedianTTR))
        .attr("y1", paddingStyle.top)
        .attr("x2", xScaleStyle(globalMedianTTR))
        .attr("y2", heightStyle - paddingStyle.bottom);

    const labels = [
        { text: "Complejo/Analítico", x: widthStyle - paddingStyle.right - 10, y: paddingStyle.top + 20, anchor: "end" },
        { text: "Simple/Directo", x: paddingStyle.left + 10, y: heightStyle - paddingStyle.bottom - 15, anchor: "start" },
        { text: "Oraciones Largas", x: paddingStyle.left + 10, y: paddingStyle.top + 20, anchor: "start" },
        { text: "Vocabulario Rico", x: widthStyle - paddingStyle.right - 10, y: heightStyle - paddingStyle.bottom - 15, anchor: "end" }
    ];

    lGroup.selectAll(".quadrant-label")
        .data(labels)
        .join("text")
        .attr("class", "quadrant-label")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", d => d.anchor)
        .text(d => d.text);
}

function renderStylePlot() {
    const dotsLayer = svgStyle.select(".dots-layer");

    dotsLayer.selectAll(".style-dot")
        .data(allStyleData, d => d.id)
        .join("circle")
        .attr("class", "style-dot")
        .attr("cx", d => xScaleStyle(d.ttr))
        .attr("cy", d => yScaleStyle(d.sentLen))
        .attr("r", 5.5)
        .attr("fill", d => getStyleColor(d))
        .style("fill-opacity", d => {
            if (selectedStyleCountry === "all") return 0.75;
            return d.country === selectedStyleCountry ? 0.9 : 0.1;
        })
        .style("stroke-opacity", d => {
            if (selectedStyleCountry === "all") return 0.8;
            return d.country === selectedStyleCountry ? 1.0 : 0.15;
        })
        .on("mouseover", handleStyleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave);
}

function updateStyleVisualization(stepIndex) {
    if (!svgStyle || !analyticMedia || !directMedia) return;

    if (stepIndex === 1) {
        svgStyle.selectAll(".style-dot")
            .transition()
            .duration(450)
            .attr("r", d => {
                if (d.id === analyticMedia.id || d.id === directMedia.id) return 10.5;
                return 4.5;
            })
            .style("fill-opacity", d => {
                if (d.id === analyticMedia.id || d.id === directMedia.id) return 1.0;
                if (selectedStyleCountry === "all") return 0.25;
                return d.country === selectedStyleCountry ? 0.35 : 0.05;
            })
            .style("stroke", d => {
                if (d.id === analyticMedia.id || d.id === directMedia.id) return "#1f1e1d";
                return "rgba(255, 255, 255, 0.8)";
            })
            .style("stroke-width", d => {
                if (d.id === analyticMedia.id || d.id === directMedia.id) return "2.5px";
                return "0.75px";
            });
    } else {
        svgStyle.selectAll(".style-dot")
            .transition()
            .duration(450)
            .attr("r", 5.5)
            .style("fill-opacity", d => {
                if (selectedStyleCountry === "all") return 0.75;
                return d.country === selectedStyleCountry ? 0.9 : 0.1;
            })
            .style("stroke", "rgba(255, 255, 255, 0.8)")
            .style("stroke-width", "0.75px");
    }
}

function highlightStyleCountry(country) {
    selectedStyleCountry = country;
    const activeStep = document.querySelector("#scrolly-style article .step.is-active");
    const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
    updateStyleVisualization(stepIndex);
}

function bindFilterEvents() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", function() {
            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const country = this.getAttribute("data-country");
            highlightStyleCountry(country);
        });
    });
}

// ==========================================
// SECTION 3: STACKED BAR CHART (POS Tags)
// ==========================================

/**
 * Auxiliary POS JSON parser function.
 */
function parsePosJson(jsonData, countryCode) {
    const parsed = [];
    Object.keys(jsonData).forEach(mediaName => {
        const counts = jsonData[mediaName];
        const total = d3.sum(Object.values(counts));
        if (total === 0) return;

        const adjCount = (counts.JJ || 0) + (counts.JJR || 0) + (counts.JJS || 0);
        const verbCount = (counts.VB || 0) + (counts.VBD || 0) + (counts.VBG || 0) + 
                          (counts.VBN || 0) + (counts.VBP || 0) + (counts.VBZ || 0);
        const nounCount = (counts.NN || 0) + (counts.NNS || 0) + (counts.NNP || 0) + (counts.NNPS || 0);
        
        const adjPct = (adjCount / total) * 100;
        const verbPct = (verbCount / total) * 100;
        const nounPct = (nounCount / total) * 100;
        const otrosPct = 100 - (adjPct + verbPct + nounPct);

        parsed.push({
            id: `${countryCode}_${mediaName}`,
            media: mediaName,
            country: countryCode,
            adjetivos: adjPct,
            verbos: verbPct,
            sustantivos: nounPct,
            otros: otrosPct,
            totalTokens: total
        });
    });
    return parsed;
}

/**
 * Computes descriptive statistics for Section 3.
 */
function calculatePosStorytelling() {
    const countries = ["AR", "CL", "ES", "MX"];
    let maxAdjPct = -1;
    let maxCountryAvg = -1;
    let topCountry = "";

    countries.forEach(c => {
        const countryNodes = allPosData.filter(d => d.country === c);
        const avgAdj = d3.mean(countryNodes, d => d.adjetivos);
        posCountryAverages[c] = avgAdj;

        if (avgAdj > maxCountryAvg) {
            maxCountryAvg = avgAdj;
            topCountry = c;
        }

        countryNodes.forEach(node => {
            if (node.adjetivos > maxAdjPct) {
                maxAdjPct = node.adjetivos;
                maxAdjectiveMedia = node;
            }
        });
    });

    maxAdjectiveCountry = topCountry;
    generatePosStorytellingText();
}

function generatePosStorytellingText() {
    const container = document.getElementById("storytelling-insights-pos");
    if (!container) return;

    const countryName = countryNames[maxAdjectiveCountry];
    container.innerHTML = `
        <p>
            <strong>¿Noticia o Editorial?</strong> En promedio, <strong>${countryName}</strong> lidera la carga de adjetivos en Hispanoamérica. 
            Destaca el medio <strong>${maxAdjectiveMedia.media}</strong> donde el <strong>${maxAdjectiveMedia.adjetivos.toFixed(1)}%</strong> 
            del contenido principal son calificaciones de la realidad.
        </p>
    `;
}

/**
 * Loads JSON files for Section 3.
 */
function loadPosData() {
    return Promise.all([
        d3.json("data/pos_tagging/top_pos_tags_per_country_and_media/news_argentina_top_pos_per_media.json"),
        d3.json("data/pos_tagging/top_pos_tags_per_country_and_media/news_chile_top_pos_per_media.json"),
        d3.json("data/pos_tagging/top_pos_tags_per_country_and_media/news_espana_top_pos_per_media.json"),
        d3.json("data/pos_tagging/top_pos_tags_per_country_and_media/news_mexico_top_pos_per_media.json")
    ]).then(([arPos, clPos, esPos, mxPos]) => {
        const arParsed = parsePosJson(arPos, "AR");
        const clParsed = parsePosJson(clPos, "CL");
        const esParsed = parsePosJson(esPos, "ES");
        const mxParsed = parsePosJson(mxPos, "MX");

        allPosData = [...arParsed, ...clParsed, ...esParsed, ...mxParsed];

        calculatePosStorytelling();
    });
}

function handlePosMouseOver(event, d, key) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    
    const labelNames = {
        "adjetivos": "Adjetivos (Subjetividad)",
        "verbos": "Verbos (Acción)",
        "sustantivos": "Sustantivos (Referencia)",
        "otros": "Otros elementos gramaticales"
    };

    const value = d[1] - d[0];

    tooltip.html(`
        <div class="tooltip-title">${d.data.media}</div>
        <div class="tooltip-row"><strong>Categoría:</strong> ${labelNames[key]}</div>
        <div class="tooltip-row"><strong>Proporción:</strong> ${value.toFixed(2)}%</div>
        <div class="tooltip-row" style="font-size:0.75rem; color:#b5b0aa; margin-top:0.4rem;">
            País: ${countryNames[d.data.country]} | Total tokens: ${d.data.totalTokens.toLocaleString()}
        </div>
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

/**
 * Initializes the D3 100% Stacked Bar Chart canvas structure.
 */
function setupD3PosCanvas() {
    const canvas = document.getElementById("d3-canvas-pos");
    if (!canvas) return;

    canvas.innerHTML = "";
    widthPos = canvas.clientWidth;
    heightPos = canvas.clientHeight;

    svgPos = d3.select(canvas)
        .append("svg")
        .attr("width", widthPos)
        .attr("height", heightPos)
        .attr("viewBox", `0 0 ${widthPos} ${heightPos}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    xScalePos = d3.scaleLinear()
        .domain([0, 100])
        .range([paddingPos.left, widthPos - paddingPos.right]);

    yScalePos = d3.scaleBand()
        .range([paddingPos.top, heightPos - paddingPos.bottom])
        .padding(0.22);

    svgPos.append("g").attr("class", "bars-layer");
    svgPos.append("g").attr("class", "x-axis axis");
    svgPos.append("g").attr("class", "y-axis axis");

    renderPosPlot();
}

/**
 * Renders the 100% stacked horizontal bars, applying transitions.
 */
function renderPosPlot() {
    if (!svgPos) return;

    let visiblePosData = allPosData.filter(d => d.country === selectedPosCountry);

    if (isSortedBySubjectivity) {
        visiblePosData.sort((a, b) => b.adjetivos - a.adjetivos);
    } else {
        visiblePosData.sort((a, b) => a.media.localeCompare(b.media));
    }

    const mediaNames = visiblePosData.map(d => d.media);
    yScalePos.domain(mediaNames);

    svgPos.select(".y-axis")
        .attr("transform", `translate(${paddingPos.left}, 0)`)
        .transition()
        .duration(600)
        .call(d3.axisLeft(yScalePos))
        .selectAll("text")
        .style("font-family", "var(--font-sans)")
        .style("font-size", "0.72rem")
        .style("fill", "var(--color-text-muted)");

    svgPos.select(".x-axis")
        .attr("transform", `translate(0, ${heightPos - paddingPos.bottom})`)
        .transition()
        .duration(600)
        .call(d3.axisBottom(xScalePos).ticks(5).tickFormat(d => d + "%"));

    const keys = ["adjetivos", "verbos", "sustantivos", "otros"];
    const stackedData = d3.stack().keys(keys)(visiblePosData);

    const posColors = d3.scaleOrdinal()
        .domain(keys)
        .range(["#ff7a00", "#3b82f6", "#555555", "#e5e7eb"]);

    const series = svgPos.select(".bars-layer")
        .selectAll(".series")
        .data(stackedData, d => d.key);

    const seriesEnter = series.enter()
        .append("g")
        .attr("class", "series")
        .attr("fill", d => posColors(d.key));

    const seriesGroup = seriesEnter.merge(series);

    const rects = seriesGroup.selectAll("rect")
        .data(d => d, d => d.data.id);

    rects.exit()
        .transition()
        .duration(400)
        .attr("width", 0)
        .remove();

    const rectsEnter = rects.enter()
        .append("rect")
        .attr("class", "pos-rect")
        .attr("y", d => yScalePos(d.data.media))
        .attr("x", d => xScalePos(d[0]))
        .attr("height", yScalePos.bandwidth())
        .attr("width", 0)
        .on("mouseover", function(event, d) {
            const key = d3.select(this.parentNode).datum().key;
            handlePosMouseOver(event, d, key);
        })
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave);

    rectsEnter.merge(rects)
        .transition()
        .duration(750)
        .attr("y", d => yScalePos(d.data.media))
        .attr("x", d => xScalePos(d[0]))
        .attr("height", yScalePos.bandwidth())
        .attr("width", d => xScalePos(d[1]) - xScalePos(d[0]));
}

function updatePosVisualization(stepIndex) {
    if (!svgPos || allPosData.length === 0) return;

    if (stepIndex === 1) {
        const visibleData = allPosData.filter(d => d.country === selectedPosCountry);
        if (visibleData.length === 0) return;
        
        const topMediaInCountry = visibleData.reduce((prev, curr) => (prev.adjetivos > curr.adjetivos) ? prev : curr, visibleData[0]);

        svgPos.selectAll(".pos-rect")
            .transition()
            .duration(450)
            .style("fill-opacity", d => {
                if (d.data.id === topMediaInCountry.id) return 1.0;
                return 0.2;
            });
    } else {
        svgPos.selectAll(".pos-rect")
            .transition()
            .duration(450)
            .style("fill-opacity", 1.0);
    }
}

function bindPosEvents() {
    const buttons = document.querySelectorAll(".pos-filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", function() {
            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            selectedPosCountry = this.getAttribute("data-country");
            renderPosPlot();

            const activeStep = document.querySelector("#scrolly-pos article .step.is-active");
            const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
            updatePosVisualization(stepIndex);
        });
    });

    const sortBtn = document.getElementById("btn-sort-pos");
    const resetBtn = document.getElementById("btn-reset-pos");

    if (sortBtn) {
        sortBtn.addEventListener("click", function() {
            isSortedBySubjectivity = true;
            this.classList.add("active");
            if (resetBtn) resetBtn.classList.remove("active");
            renderPosPlot();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", function() {
            isSortedBySubjectivity = false;
            if (sortBtn) sortBtn.classList.remove("active");
            renderPosPlot();
        });
    }
}

// ==========================================
// SECTION 5: RIDGELINE PLOT (Emotions)
// ==========================================

/**
 * Groups and aggregates emotions data monthly for clean, organic peaks.
 */
function aggregateMonthly(rawData) {
    const rolled = d3.rollups(
        rawData,
        v => d3.mean(v, d => d.intensity),
        d => countryMappingEmotions[d.country],
        d => d.emotion,
        d => d3.timeMonth(d.date)
    );
    
    const aggregated = [];
    rolled.forEach(([country, emotionsMap]) => {
        emotionsMap.forEach(([emotion, monthsMap]) => {
            monthsMap.forEach(([monthDate, meanIntensity]) => {
                aggregated.push({
                    country: country,
                    emotion: emotion,
                    date: monthDate,
                    intensity: meanIntensity
                });
            });
        });
    });
    
    aggregated.sort((a, b) => a.date - b.date);
    return aggregated;
}

/**
 * Calculates emotional text metrics for storytelling in Section 5.
 */
function calculateEmotionsStorytelling() {
    const countries = ["AR", "CL", "ES", "MX"];
    const countryNamesSpanish = {
        "AR": "Argentina",
        "CL": "Chile",
        "ES": "España",
        "MX": "México"
    };
    const emotionsList = ["alegría", "miedo", "ira", "tristeza"];

    countries.forEach(cCode => {
        const countryData = allEmotionsRawData.filter(d => countryMappingEmotions[d.country] === cCode);
        if (countryData.length === 0) return;

        const averages = {};
        emotionsList.forEach(emotion => {
            const emotionData = countryData.filter(d => d.emotion === emotion);
            averages[emotion] = d3.mean(emotionData, d => d.intensity) || 0;
        });

        let topEmotion = emotionsList[0];
        let maxAvg = averages[topEmotion];
        emotionsList.forEach(emotion => {
            if (averages[emotion] > maxAvg) {
                maxAvg = averages[emotion];
                topEmotion = emotion;
            }
        });

        const topEmotionData = countryData.filter(d => d.emotion === topEmotion);
        let peakRecord = topEmotionData[0];
        topEmotionData.forEach(d => {
            if (d.intensity > peakRecord.intensity) {
                peakRecord = d;
            }
        });

        const formattedDate = peakRecord.date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        emotionsStorytellingData[cCode] = {
            countryName: countryNamesSpanish[cCode],
            topEmotion: topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1),
            peakDate: formattedDate,
            peakIntensity: peakRecord.intensity
        };
    });

    generateEmotionsStorytellingText();
}

function generateEmotionsStorytellingText() {
    const container = document.getElementById("storytelling-insights-emotions");
    if (!container) return;

    let html = '<div class="insights-grid">';
    Object.keys(emotionsStorytellingData).forEach(cCode => {
        const d = emotionsStorytellingData[cCode];
        html += `
            <div class="insight-card country-border-${cCode.toLowerCase()}">
                <h4 class="insight-country">${d.countryName}</h4>
                <p class="insight-text">
                    El negocio de la ansiedad: Al observar el año, la emoción predominante que moviliza las portadas en <strong>${d.countryName}</strong> es <strong>${d.topEmotion}</strong>. Notablemente, en <strong>${d.peakDate}</strong>, los índices rompieron récords.
                </p>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Loads JSON files for Section 5.
 */
function loadEmotionsData() {
    return Promise.all([
        d3.json("data/emotions/news_argentina_emotions_per_media.json"),
        d3.json("data/emotions/news_chile_emotions_per_media.json"),
        d3.json("data/emotions/news_espana_emotions_per_media.json"),
        d3.json("data/emotions/news_mexico_emotions_per_media.json")
    ]).then(([arEm, clEm, esEm, mxEm]) => {
        arEm.forEach(d => d.country = "argentina");
        clEm.forEach(d => d.country = "chile");
        esEm.forEach(d => d.country = "espana");
        mxEm.forEach(d => d.country = "mexico");

        allEmotionsRawData = [...arEm, ...clEm, ...esEm, ...mxEm];
        
        const dateParser = d3.timeParse("%Y-%m-%d");
        allEmotionsRawData.forEach(d => {
            d.date = dateParser(d.date);
            d.intensity = +d.intensity;
            d.country = d.country.toLowerCase();
        });

        calculateEmotionsStorytelling();
        allEmotionsAggregatedData = aggregateMonthly(allEmotionsRawData);
    });
}

/**
 * Initializes the Ridgeline plot canvas structure.
 */
function setupD3EmotionsCanvas() {
    const canvas = document.getElementById("d3-canvas-emotions");
    if (!canvas) return;

    canvas.innerHTML = "";
    widthEmotions = canvas.clientWidth;
    heightEmotions = canvas.clientHeight;

    svgEmotions = d3.select(canvas)
        .append("svg")
        .attr("width", widthEmotions)
        .attr("height", heightEmotions)
        .attr("viewBox", `0 0 ${widthEmotions} ${heightEmotions}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const dateExtent = d3.extent(allEmotionsAggregatedData, d => d.date);
    xScaleEmotions = d3.scaleTime()
        .domain(dateExtent)
        .range([paddingEmotions.left, widthEmotions - paddingEmotions.right]);

    svgEmotions.append("g").attr("class", "baselines-layer");
    svgEmotions.append("g").attr("class", "areas-layer");
    svgEmotions.append("g").attr("class", "strokes-layer");
    svgEmotions.append("g").attr("class", "labels-layer");
    svgEmotions.append("g").attr("class", "x-axis axis");

    renderEmotionsPlot();
}

/**
 * Renders Ridgelines and transitions curves based on the selected emotion.
 */
function renderEmotionsPlot() {
    if (!svgEmotions) return;

    const visibleEmotionsData = allEmotionsAggregatedData.filter(d => d.emotion === selectedEmotion);
    const maxVal = d3.max(visibleEmotionsData, d => d.intensity) || 0.05;
    const ySpacing = (heightEmotions - paddingEmotions.top - paddingEmotions.bottom) / 3.8;

    yScaleIntensityEmotions = d3.scaleLinear()
        .domain([0, maxVal])
        .range([0, ySpacing * 1.45]); // Overlap factor

    // Share X axis only at the bottom baseline (México)
    const xAxis = d3.axisBottom(xScaleEmotions).ticks(6).tickFormat(d3.timeFormat("%Y"));
    svgEmotions.select(".x-axis")
        .attr("transform", `translate(0, ${paddingEmotions.top + 3 * ySpacing + ySpacing * 0.7})`)
        .transition()
        .duration(800)
        .call(xAxis)
        .selectAll("text")
        .style("font-family", "var(--font-sans)")
        .style("font-size", "0.75rem")
        .style("fill", "var(--color-text-muted)");

    const countries = ["AR", "CL", "ES", "MX"];
    const countryBaselines = {};
    countries.forEach((c, i) => {
        countryBaselines[c] = paddingEmotions.top + i * ySpacing + ySpacing * 0.7;
    });

    // Draw straight baselines
    svgEmotions.select(".baselines-layer").selectAll(".ridgeline-baseline")
        .data(countries)
        .join("line")
        .attr("class", "ridgeline-baseline")
        .attr("x1", paddingEmotions.left)
        .attr("y1", c => countryBaselines[c])
        .attr("x2", widthEmotions - paddingEmotions.right)
        .attr("y2", c => countryBaselines[c]);

    // Area and Line generators using d3.curveBasis (Suavizado orgánico)
    const area = d3.area()
        .curve(d3.curveBasis)
        .x(d => xScaleEmotions(d.date))
        .y0(d => countryBaselines[d.country])
        .y1(d => countryBaselines[d.country] - yScaleIntensityEmotions(d.intensity));

    const line = d3.line()
        .curve(d3.curveBasis)
        .x(d => xScaleEmotions(d.date))
        .y(d => countryBaselines[d.country] - yScaleIntensityEmotions(d.intensity));

    // Area path joining
    svgEmotions.select(".areas-layer").selectAll(".ridgeline-area")
        .data(countries)
        .join("path")
        .attr("class", "ridgeline-area")
        .attr("fill", c => {
            switch(c) {
                case "AR": return "var(--color-ar)";
                case "CL": return "var(--color-cl)";
                case "ES": return "var(--color-es)";
                case "MX": return "var(--color-mx)";
            }
        })
        .transition()
        .duration(800)
        .attr("d", c => {
            const countryPoints = visibleEmotionsData.filter(d => d.country === c);
            return area(countryPoints);
        });

    // Outline stroke path joining
    svgEmotions.select(".strokes-layer").selectAll(".ridgeline-stroke")
        .data(countries)
        .join("path")
        .attr("class", "ridgeline-stroke")
        .attr("stroke", c => {
            switch(c) {
                case "AR": return "var(--color-ar)";
                case "CL": return "var(--color-cl)";
                case "ES": return "var(--color-es)";
                case "MX": return "var(--color-mx)";
            }
        })
        .transition()
        .duration(800)
        .attr("d", c => {
            const countryPoints = visibleEmotionsData.filter(d => d.country === c);
            return line(countryPoints);
        });

    // Draw row baseline labels on the left
    const countryNamesSpanish = {
        "AR": "Argentina",
        "CL": "Chile",
        "ES": "España",
        "MX": "México"
    };

    svgEmotions.select(".labels-layer").selectAll(".ridgeline-country-label")
        .data(countries)
        .join("text")
        .attr("class", "ridgeline-country-label")
        .attr("x", paddingEmotions.left - 15)
        .attr("y", c => countryBaselines[c] - 5)
        .attr("text-anchor", "end")
        .text(c => countryNamesSpanish[c]);
}

/**
 * Interactively highlights peak intensity coordinates in Step 2.
 */
function updateEmotionsVisualization(stepIndex) {
    if (!svgEmotions || allEmotionsAggregatedData.length === 0) return;

    const visibleEmotionsData = allEmotionsAggregatedData.filter(d => d.emotion === selectedEmotion);
    const countries = ["AR", "CL", "ES", "MX"];
    const ySpacing = (heightEmotions - paddingEmotions.top - paddingEmotions.bottom) / 3.8;
    const countryBaselines = {};
    countries.forEach((c, i) => {
        countryBaselines[c] = paddingEmotions.top + i * ySpacing + ySpacing * 0.7;
    });

    if (stepIndex === 1) {
        // Step 2: Calculate and highlight max peaks
        const peaks = [];
        countries.forEach(c => {
            const countryPoints = visibleEmotionsData.filter(d => d.country === c);
            if (countryPoints.length > 0) {
                const peak = countryPoints.reduce((prev, curr) => (curr.intensity > prev.intensity) ? curr : prev, countryPoints[0]);
                peaks.push(peak);
            }
        });

        // Vertical guide line
        svgEmotions.select(".labels-layer").selectAll(".peak-guide")
            .data(peaks, d => d.country)
            .join("line")
            .attr("class", "peak-guide")
            .attr("x1", d => xScaleEmotions(d.date))
            .attr("y1", d => countryBaselines[d.country])
            .attr("x2", d => xScaleEmotions(d.date))
            .attr("y2", d => countryBaselines[d.country] - yScaleIntensityEmotions(d.intensity))
            .attr("stroke", "#1f1e1d")
            .attr("stroke-width", "1.2px")
            .attr("stroke-dasharray", "2,2")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 0.7);

        // Peak target dot
        svgEmotions.select(".labels-layer").selectAll(".peak-dot")
            .data(peaks, d => d.country)
            .join("circle")
            .attr("class", "peak-dot")
            .attr("cx", d => xScaleEmotions(d.date))
            .attr("cy", d => countryBaselines[d.country] - yScaleIntensityEmotions(d.intensity))
            .attr("r", 5)
            .attr("fill", "#1f1e1d")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "1.5px")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1.0);
    } else {
        // Step 1: Remove guides
        svgEmotions.selectAll(".peak-guide")
            .transition()
            .duration(300)
            .style("opacity", 0)
            .remove();

        svgEmotions.selectAll(".peak-dot")
            .transition()
            .duration(300)
            .style("opacity", 0)
            .remove();
    }
}

function bindEmotionsEvents() {
    const buttons = document.querySelectorAll(".emotion-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", function() {
            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            selectedEmotion = this.getAttribute("data-emotion");
            renderEmotionsPlot();

            const activeStep = document.querySelector("#scrolly-emotions article .step.is-active");
            const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
            updateEmotionsVisualization(stepIndex);
        });
    });
}

// ==========================================
// COMPONENT BOOTSTRAPPER & EVENT MANAGERS
// ==========================================

function initScrollama1() {
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const steps = document.querySelectorAll("#scrolly article .step");
            steps.forEach((step, idx) => {
                step.classList.toggle("is-active", idx === stepIndex);
            });
            updateVisualization(stepIndex);
        });
    updateVisualization(0);
}

function initScrollama2() {
    scrollerStyle
        .setup({
            step: "#scrolly-style article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const steps = document.querySelectorAll("#scrolly-style article .step");
            steps.forEach((step, idx) => {
                step.classList.toggle("is-active", idx === stepIndex);
            });
            updateStyleVisualization(stepIndex);
        });
    updateStyleVisualization(0);
}

function initScrollama3() {
    scrollerPos
        .setup({
            step: "#scrolly-pos article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const steps = document.querySelectorAll("#scrolly-pos article .step");
            steps.forEach((step, idx) => {
                step.classList.toggle("is-active", idx === stepIndex);
            });
            updatePosVisualization(stepIndex);
        });
    updatePosVisualization(0);
}

function initScrollamaEmotions() {
    scrollerEmotions
        .setup({
            step: "#scrolly-emotions article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const steps = document.querySelectorAll("#scrolly-emotions article .step");
            steps.forEach((step, idx) => {
                step.classList.toggle("is-active", idx === stepIndex);
            });
            updateEmotionsVisualization(stepIndex);
        });
    updateEmotionsVisualization(0);
}

/**
 * Handle window resizing to keep all charts responsive
 */
function handleResize() {
    // 1. Resize Section 1 (Bubble Chart)
    const canvas = document.getElementById("d3-canvas");
    if (canvas && svg) {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        svg.attr("width", width)
           .attr("height", height)
           .attr("viewBox", `0 0 ${width} ${height}`);

        updateCenters();
        const bgLayer = svg.select(".background-labels-layer");
        const fgLayer = svg.select(".foreground-labels-layer");
        drawLabels(bgLayer, fgLayer);

        if (simulation) {
            simulation.force("x", d3.forceX(d => countryCenters[d.country].x).strength(0.18));
            simulation.force("y", d3.forceY(d => countryCenters[d.country].y).strength(0.18));
            simulation.alpha(0.5).restart();
        }
    }

    // 2. Resize Section 2 (Scatter Plot)
    const canvasStyle = document.getElementById("d3-canvas-style");
    if (canvasStyle && svgStyle) {
        widthStyle = canvasStyle.clientWidth;
        heightStyle = canvasStyle.clientHeight;
        svgStyle.attr("width", widthStyle)
                .attr("height", heightStyle)
                .attr("viewBox", `0 0 ${widthStyle} ${heightStyle}`);

        xScaleStyle.range([paddingStyle.left, widthStyle - paddingStyle.right]);
        yScaleStyle.range([heightStyle - paddingStyle.bottom, paddingStyle.top]);

        drawStyleGrid();
        renderStylePlot();
        
        const activeStep = document.querySelector("#scrolly-style article .step.is-active");
        const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
        updateStyleVisualization(stepIndex);
    }

    // 3. Resize Section 3 (POS Stacked Bar Chart)
    const canvasPos = document.getElementById("d3-canvas-pos");
    if (canvasPos && svgPos) {
        widthPos = canvasPos.clientWidth;
        heightPos = canvasPos.clientHeight;
        svgPos.attr("width", widthPos)
              .attr("height", heightPos)
              .attr("viewBox", `0 0 ${widthPos} ${heightPos}`);

        xScalePos.range([paddingPos.left, widthPos - paddingPos.right]);
        yScalePos.range([paddingPos.top, heightPos - paddingPos.bottom]);

        renderPosPlot();

        const activeStep = document.querySelector("#scrolly-pos article .step.is-active");
        const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
        updatePosVisualization(stepIndex);
    }

    // 4. Resize Section 5 (Ridgeline Chart)
    const canvasEmotions = document.getElementById("d3-canvas-emotions");
    if (canvasEmotions && svgEmotions) {
        widthEmotions = canvasEmotions.clientWidth;
        heightEmotions = canvasEmotions.clientHeight;
        svgEmotions.attr("width", widthEmotions)
                   .attr("height", heightEmotions)
                   .attr("viewBox", `0 0 ${widthEmotions} ${heightEmotions}`);

        xScaleEmotions.range([paddingEmotions.left, widthEmotions - paddingEmotions.right]);

        renderEmotionsPlot();

        const activeStep = document.querySelector("#scrolly-emotions article .step.is-active");
        const stepIndex = activeStep ? parseInt(activeStep.getAttribute("data-step").split(".")[1]) - 1 : 0;
        updateEmotionsVisualization(stepIndex);
    }

    // 5. Resize Section 6 (NER Map)
    const canvasMap = document.getElementById("d3-canvas-map");
    if (canvasMap && svgMap) {
        widthMap = canvasMap.clientWidth;
        heightMap = canvasMap.clientHeight;
        svgMap.attr("width", widthMap)
              .attr("height", heightMap)
              .attr("viewBox", `0 0 ${widthMap} ${heightMap}`);

        projectionMap.scale(widthMap * 0.28).translate([widthMap / 2, heightMap / 2]);
        renderMapPlot();
        
        zoomToCountry(selectedMapCountry);
    }

    // 6. Resize Section 7 (Beeswarm)
    const canvasBeeswarm = document.getElementById("d3-canvas-beeswarm");
    if (canvasBeeswarm && svgBeeswarm) {
        widthBeeswarm = canvasBeeswarm.clientWidth;
        heightBeeswarm = canvasBeeswarm.clientHeight;
        svgBeeswarm.attr("width", widthBeeswarm)
                   .attr("height", heightBeeswarm)
                   .attr("viewBox", `0 0 ${widthBeeswarm} ${heightBeeswarm}`);
        setupD3BeeswarmCanvas();
    }

    // 7. Resize Section 8 (Sankey)
    const canvasSankey = document.getElementById("d3-canvas-sankey");
    if (canvasSankey && svgSankey) {
        widthSankey = canvasSankey.clientWidth;
        heightSankey = canvasSankey.clientHeight || 450;
        svgSankey.attr("width", widthSankey)
                 .attr("height", heightSankey)
                 .attr("viewBox", `0 0 ${widthSankey} ${heightSankey}`);
        setupD3SankeyCanvas();
    }

    // 8. Inform Scrollama instances
    scroller.resize();
    scrollerStyle.resize();
    scrollerPos.resize();
    scrollerEmotions.resize();
    scrollerMap.resize();
    scrollerBeeswarm.resize();
    scrollerSankey.resize();
}

/**
 * Main bootstrapper function.
 */
function init() {
    // Load datasets for all sections in parallel
    Promise.all([
        loadData(),
        loadStyleData(),
        loadPosData(),
        loadEmotionsData(),
        loadMapData(),
        loadBeeswarmData(),
        loadSankeyData()
    ]).then(() => {
        // Initialize Section 1
        setupD3Canvas();
        initScrollama1();

        // Initialize Section 2
        setupD3StyleCanvas();
        bindFilterEvents();
        initScrollama2();

        // Initialize Section 3
        setupD3PosCanvas();
        bindPosEvents();
        initScrollama3();

        // Initialize Section 5
        setupD3EmotionsCanvas();
        bindEmotionsEvents();
        initScrollamaEmotions();

        // Initialize Section 6
        setupD3MapCanvas();
        bindMapEvents();
        initScrollamaMap();

        // Initialize Section 7
        setupD3BeeswarmCanvas();
        initScrollamaBeeswarm();

        // Initialize Section 8
        setupD3SankeyCanvas();
        bindSankeyEvents();
        initScrollamaSankey();

        // Window resize event handler
        window.addEventListener("resize", handleResize);

        console.log("[Init] Scrollytelling visualizers fully initialized.");
    }).catch(error => {
        console.error("[Init Error] Failed to load data or initialize visualizers:", error);
    });
}

// ==========================================
// SECTION 6: NER BUBBLE MAP
// ==========================================

function loadMapData() {
    return Promise.all([
        d3.json("data/NER/world-110m.json"),
        d3.csv("data/NER/LOC/argentina_loc_ents_with_geoloc.csv"),
        d3.csv("data/NER/LOC/chile_loc_ents_with_geoloc.csv"),
        d3.csv("data/NER/LOC/españa_loc_ents_with_geoloc.csv"),
        d3.csv("data/NER/LOC/mexico_loc_ents_with_geoloc.csv")
    ]).then(([worldMap, arCSV, clCSV, esCSV, mxCSV]) => {
        worldGeoData = worldMap;

        const areSimilar = (name1, name2) => {
            const n1 = name1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const n2 = name2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            
            if (n1 === n2) return true;
            if (n1.length > 4 && n2.length > 4) {
                if (n1.includes(n2) || n2.includes(n1)) return true;
            }
            return false;
        };

        const filterTop15 = (data) => {
            const result = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (+item.mentions <= 0) continue;
                
                let isDuplicate = false;
                for (let j = 0; j < result.length; j++) {
                    if (areSimilar(item.city, result[j].city)) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    result.push(item);
                }
                if (result.length === 15) {
                    break;
                }
            }
            return result;
        };

        const processCSV = (csv, cCode) => {
            csv.forEach(d => {
                d.mentions = +d.mentions;
                d.lat = +d.lat;
                d.lon = +d.lon;
                d.countryCode = cCode;
            });

            const totalMentions = d3.sum(csv, d => d.mentions) || 1;
            const topCity = csv[0];
            const topCityName = topCity ? topCity.city : "Capital";
            const topCityMentions = topCity ? topCity.mentions : 0;
            const percentage = (topCityMentions / totalMentions) * 100;

            mapStorytellingData[cCode] = {
                total: totalMentions,
                topCity: topCityName,
                topCityMentions: topCityMentions,
                percentage: percentage
            };

            const filtered = filterTop15(csv);
            allMapData = allMapData.concat(filtered);
        };

        allMapData = [];
        processCSV(arCSV, "AR");
        processCSV(clCSV, "CL");
        processCSV(esCSV, "ES");
        processCSV(mxCSV, "MX");

        updateMapStorytellingHTML();
    });
}

function updateMapStorytellingHTML() {
    const containerCL = document.getElementById("map-insight-CL");
    const containerAR = document.getElementById("map-insight-AR");
    const containerMX = document.getElementById("map-insight-MX");

    if (containerCL && mapStorytellingData["CL"]) {
        const d = mapStorytellingData["CL"];
        containerCL.innerHTML = `<p>El hiper-centralismo informativo: En <strong>Chile</strong>, de todas las localidades mencionadas, solo <strong>${d.topCity}</strong> acapara el <strong>${d.percentage.toFixed(1)}%</strong> de la pauta. El interior del país es invisible para los principales medios.</p>`;
    }
    if (containerAR && mapStorytellingData["AR"]) {
        const d = mapStorytellingData["AR"];
        containerAR.innerHTML = `<p>El hiper-centralismo informativo: En <strong>Argentina</strong>, de todas las localidades mencionadas, solo <strong>${d.topCity}</strong> acapara el <strong>${d.percentage.toFixed(1)}%</strong> de la pauta. El interior del país es invisible para los principales medios.</p>`;
    }
    if (containerMX && mapStorytellingData["MX"] && mapStorytellingData["ES"]) {
        const dMX = mapStorytellingData["MX"];
        const dES = mapStorytellingData["ES"];
        containerMX.innerHTML = `
            <p>El hiper-centralismo informativo: En <strong>México</strong>, la atención en <strong>${dMX.topCity}</strong> representa el <strong>${dMX.percentage.toFixed(1)}%</strong> de la pauta. En <strong>España</strong>, <strong>${dES.topCity}</strong> acapara el <strong>${dES.percentage.toFixed(1)}%</strong>. En ambos casos, las capitales concentran la cobertura noticiosa, atenuando el resto de las regiones.</p>
        `;
    }
}

function handleMapMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    tooltip.html(`
        <div class="tooltip-title">${d.city}</div>
        <div class="tooltip-row"><strong>País:</strong> ${countryNames[d.countryCode]}</div>
        <div class="tooltip-row"><strong>Menciones (NER):</strong> ${d.mentions.toLocaleString()}</div>
        <div class="tooltip-row" style="font-size:0.75rem; color:#b5b0aa; margin-top:0.4rem;">
            Coordenadas: ${d.lat.toFixed(2)}, ${d.lon.toFixed(2)}
        </div>
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function handleMapMouseLeave() {
    tooltip.transition().duration(100).style("opacity", 0);
}

function setupD3MapCanvas() {
    const canvas = document.getElementById("d3-canvas-map");
    if (!canvas) return;

    canvas.innerHTML = "";
    widthMap = canvas.clientWidth;
    heightMap = canvas.clientHeight;

    svgMap = d3.select(canvas)
        .append("svg")
        .attr("width", widthMap)
        .attr("height", heightMap)
        .attr("viewBox", `0 0 ${widthMap} ${heightMap}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    projectionMap = d3.geoMercator()
        .center([-45, -5])
        .scale(widthMap * 0.28)
        .translate([widthMap / 2, heightMap / 2]);

    pathGeneratorMap = d3.geoPath().projection(projectionMap);

    gMap = svgMap.append("g").attr("class", "map-zoomable-group");

    zoomBehaviorMap = d3.zoom()
        .scaleExtent([1, 15])
        .on("zoom", (event) => {
            gMap.attr("transform", event.transform);
        });

    svgMap.call(zoomBehaviorMap);

    renderMapPlot();
}

function renderMapPlot() {
    if (!svgMap || !worldGeoData) return;

    const countriesGeoJSON = topojson.feature(worldGeoData, worldGeoData.objects.countries).features;

    gMap.selectAll(".map-land")
        .data(countriesGeoJSON)
        .join("path")
        .attr("class", "map-land")
        .attr("d", pathGeneratorMap)
        .classed("active-country", d => {
            const id = +d.id;
            return [32, 152, 724, 484].includes(id);
        });

    const maxMentions = d3.max(allMapData, d => d.mentions) || 1000;
    const radiusScaleMap = d3.scaleSqrt()
        .domain([1, maxMentions])
        .range([3, 26]);

    const validBubbles = allMapData.filter(d => {
        const coords = projectionMap([d.lon, d.lat]);
        return coords && !isNaN(coords[0]) && !isNaN(coords[1]) && d.mentions > 0;
    });

    gMap.selectAll(".map-bubble")
        .data(validBubbles, d => d.city + "_" + d.countryCode)
        .join("circle")
        .attr("class", "map-bubble")
        .attr("cx", d => projectionMap([d.lon, d.lat])[0])
        .attr("cy", d => projectionMap([d.lon, d.lat])[1])
        .attr("r", d => radiusScaleMap(d.mentions))
        .attr("fill", d => {
            switch(d.countryCode) {
                case "AR": return "var(--color-ar)";
                case "CL": return "var(--color-cl)";
                case "ES": return "var(--color-es)";
                case "MX": return "var(--color-mx)";
                default: return "#999";
            }
        })
        .on("mouseover", handleMapMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMapMouseLeave);
}

function zoomToCountry(countryCode) {
    if (!svgMap || !projectionMap) return;

    const config = countryCentersMap[countryCode] || countryCentersMap["all"];
    const [lon, lat] = config.center;
    const k = config.zoom;

    const [x, y] = projectionMap([lon, lat]);

    const transform = d3.zoomIdentity
        .translate(widthMap / 2 - k * x, heightMap / 2 - k * y)
        .scale(k);

    svgMap.transition()
        .duration(1000)
        .call(zoomBehaviorMap.transform, transform);

    svgMap.selectAll(".map-bubble")
        .transition()
        .duration(800)
        .style("opacity", d => {
            if (countryCode === "all" || d.countryCode === countryCode) return 0.85;
            return 0.15;
        });
}

function bindMapEvents() {
    const buttons = document.querySelectorAll(".map-country-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", function() {
            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            // Clear cycle if user clicks manually
            if (mapCycleInterval) {
                clearInterval(mapCycleInterval);
                mapCycleInterval = null;
            }

            selectedMapCountry = this.getAttribute("data-country");
            zoomToCountry(selectedMapCountry);
        });
    });
}

function initScrollamaMap() {
    scrollerMap
        .setup({
            step: "#scrolly-map article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            const steps = document.querySelectorAll("#scrolly-map article .step");
            steps.forEach((step, idx) => {
                step.classList.toggle("is-active", idx === stepIndex);
            });
            updateMapVisualization(stepIndex);
        });
    updateMapVisualization(0);
}

function updateMapVisualization(stepIndex) {
    if (!svgMap) return;

    if (mapCycleInterval) {
        clearInterval(mapCycleInterval);
        mapCycleInterval = null;
    }

    let targetCountry = "all";
    if (stepIndex === 1) targetCountry = "CL";
    else if (stepIndex === 2) targetCountry = "AR";
    else if (stepIndex === 3) {
        targetCountry = "MX";
        
        // Highlight MX button immediately on step enter
        const buttons = document.querySelectorAll(".map-country-btn");
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-country") === "MX");
        });

        let isES = false;
        mapCycleInterval = setInterval(() => {
            isES = !isES;
            const nextCountry = isES ? "ES" : "MX";
            
            const buttons = document.querySelectorAll(".map-country-btn");
            buttons.forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-country") === nextCountry);
            });
            
            zoomToCountry(nextCountry);
        }, 4500);
    }

    if (stepIndex !== 3) {
        const buttons = document.querySelectorAll(".map-country-btn");
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-country") === targetCountry);
        });
    }

    selectedMapCountry = targetCountry;
    zoomToCountry(targetCountry);
}

// Bind initialization to DOM ready event
window.addEventListener("DOMContentLoaded", init);


// ==========================================
// SECTION 8: EL ROSTRO DE LA NOTICIA (Sankey)
// ==========================================

function getNodeColor(nodeIndex) {
    const colors = {
        0: "#64748b", // Total Noticias (grey slate)
        1: "#94a3b8", // Agencias (light slate)
        2: "#64748b", // Redacción / Anónimo (slate)
        3: "#475569", // Periodista Firmante (dark slate)
        4: "#3a86c8", // Hombre (vivid blue)
        5: "#db2777", // Mujer (vivid pink)
        6: "#cbd5e1"  // No Identificado (neutral gray)
    };
    return colors[nodeIndex] || "#94a3b8";
}

function loadSankeyData() {
    const urls = {
        "AR": "data/authors/sankey/news_argentina_authorship_analysis.json",
        "CL": "data/authors/sankey/news_chile_authorship_analysis.json",
        "ES": "data/authors/sankey/news_espana_authorship_analysis.json",
        "MX": "data/authors/sankey/news_mexico_authorship_analysis.json"
    };

    const keys = Object.keys(urls);
    return Promise.all(keys.map(k => d3.json(urls[k])))
        .then(results => {
            results.forEach((data, index) => {
                allSankeyData[keys[index]] = data;
            });
            generateSankeyStorytelling();
        });
}

function generateSankeyStorytelling() {
    ["AR", "CL", "ES", "MX"].forEach(code => {
        const data = allSankeyData[code];
        if (!data) return;

        // Calculate values from links
        let total = 0;
        let agencias = 0;
        let anonimo = 0;
        let firmado = 0;
        let mujer = 0;
        let hombre = 0;

        data.links.forEach(l => {
            if (l.source === 0 && l.target === 1) agencias = l.value;
            if (l.source === 0 && l.target === 2) anonimo = l.value;
            if (l.source === 0 && l.target === 3) firmado = l.value;
            if (l.source === 3 && l.target === 5) mujer = l.value;
            if (l.source === 3 && l.target === 4) hombre = l.value;
        });

        total = agencias + anonimo + firmado;

        const industrialPct = ((agencias + anonimo) / total * 100).toFixed(1);
        const anonimoPct = (anonimo / total * 100).toFixed(1);
        const agenciasPct = (agencias / total * 100).toFixed(1);
        const womenPct = (mujer / firmado * 100).toFixed(1);

        const countryFull = countryNames[code];

        const insightEl = document.getElementById(`sankey-insight-${code}`);
        if (insightEl) {
            insightEl.innerHTML = `
                <div class="insight-card country-border-${code.toLowerCase()}">
                    <h4 class="insight-country" style="color: var(--color-${code.toLowerCase()})">${countryFull}</h4>
                    <p class="insight-text">
                        El periodismo industrial en <strong>${countryFull}</strong>: El <strong>${industrialPct}%</strong> de la información es anónima o refrito de agencia (donde el <strong>${anonimoPct}%</strong> es redacción/anónimo y el <strong>${agenciasPct}%</strong> proviene de agencias). 
                        En los reportajes que llevan firma propia, la brecha de género es evidente: solo el <strong>${womenPct}%</strong> de las firmas corresponde a periodistas mujeres.
                    </p>
                    <div class="insight-meta">
                        Firmas Hombre: ${hombre.toLocaleString()} | Firmas Mujer: ${mujer.toLocaleString()}
                    </div>
                </div>
            `;
        }
    });

    // Also populate a general card in the sticky panel
    const panel = document.getElementById("storytelling-insights-sankey");
    if (panel) {
        const cards = ["AR", "CL", "ES", "MX"].map(code => {
            const data = allSankeyData[code];
            if (!data) return "";
            
            let firmado = 1, mujer = 0;
            data.links.forEach(l => {
                if (l.source === 0 && l.target === 3) firmado = l.value;
                if (l.source === 3 && l.target === 5) mujer = l.value;
            });
            const womenPct = (mujer / firmado * 100).toFixed(1);
            const color = `var(--color-${code.toLowerCase()})`;
            return `<div class="insight-card country-border-${code.toLowerCase()}">
                <div class="insight-country" style="color:${color}">${countryNames[code]}</div>
                <div class="insight-stat">${womenPct}%</div>
                <div class="insight-label">Firmas de Mujeres</div>
            </div>`;
        }).join("");
        panel.innerHTML = `<div class="insights-grid">${cards}</div>`;
    }
}

function setupD3SankeyCanvas() {
    const canvas = document.getElementById("d3-canvas-sankey");
    if (!canvas || Object.keys(allSankeyData).length === 0) return;

    canvas.innerHTML = "";
    widthSankey = canvas.clientWidth;
    heightSankey = canvas.clientHeight || 450;

    svgSankey = d3.select(canvas)
        .append("svg")
        .attr("width", widthSankey)
        .attr("height", heightSankey)
        .attr("viewBox", `0 0 ${widthSankey} ${heightSankey}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    renderSankeyPlot(selectedSankeyCountry);
}

function renderSankeyPlot(countryCode) {
    if (!svgSankey || !allSankeyData[countryCode]) return;

    svgSankey.selectAll("*").remove();

    const rawData = allSankeyData[countryCode];
    const graph = {
        nodes: rawData.nodes.map(d => Object.assign({}, d)),
        links: rawData.links.map(d => Object.assign({}, d))
    };

    const sankeyLayout = d3.sankey()
        .nodeWidth(16)
        .nodePadding(24)
        .extent([[40, 30], [widthSankey - 40, heightSankey - 35]]);

    let nodes, links;
    try {
        const result = sankeyLayout(graph);
        nodes = result.nodes;
        links = result.links;
    } catch(e) {
        console.error("[Sankey] Layout failed:", e);
        return;
    }

    // Gradient definitions
    const defs = svgSankey.append("defs");
    links.forEach((l, i) => {
        const gradId = `sankey-grad-${countryCode}-${i}`;
        const grad = defs.append("linearGradient")
            .attr("id", gradId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", l.source.x1)
            .attr("x2", l.target.x0);

        grad.append("stop").attr("offset", "0%").attr("stop-color", getNodeColor(l.source.node));
        grad.append("stop").attr("offset", "100%").attr("stop-color", getNodeColor(l.target.node));
    });

    // Draw links
    const linkPaths = svgSankey.append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("class", "sankey-link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", (l, i) => `url(#sankey-grad-${countryCode}-${i})`)
        .attr("stroke-width", l => Math.max(1.5, l.width))
        .attr("fill", "none")
        .on("mouseover", handleSankeyLinkMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleSankeyLinkMouseLeave);

    // Draw nodes
    const nodeGroups = svgSankey.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g");

    nodeGroups.append("rect")
        .attr("class", "sankey-node")
        .attr("x", n => n.x0)
        .attr("y", n => n.y0)
        .attr("width", n => n.x1 - n.x0)
        .attr("height", n => Math.max(3, n.y1 - n.y0))
        .attr("fill", n => getNodeColor(n.node))
        .on("mouseover", handleSankeyNodeMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleSankeyNodeMouseLeave);

    // Draw node labels
    nodeGroups.append("text")
        .attr("class", "sankey-node-label")
        .attr("x", n => n.x0 < widthSankey / 2 ? n.x1 + 6 : n.x0 - 6)
        .attr("y", n => (n.y0 + n.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", n => n.x0 < widthSankey / 2 ? "start" : "end")
        .text(n => `${n.name} (${Math.round(n.value).toLocaleString()})`);
}

function handleSankeyLinkMouseOver(event, d) {
    // Dim all links and highlight hovered
    svgSankey.selectAll(".sankey-link").classed("dimmed", true);
    d3.select(event.currentTarget).classed("active", true).classed("dimmed", false);

    tooltip.transition().duration(100).style("opacity", 0.96);
    
    // Percentage relative to source
    const pct = (d.value / d.source.value * 100).toFixed(1);
    
    tooltip.html(`
        <div class="tooltip-title">Flujo de Autoría</div>
        <div class="tooltip-row"><strong>Origen:</strong> ${d.source.name}</div>
        <div class="tooltip-row"><strong>Destino:</strong> ${d.target.name}</div>
        <div class="tooltip-row"><strong>Volumen:</strong> ${Math.round(d.value).toLocaleString()} noticias</div>
        <div class="tooltip-row"><strong>Proporción:</strong> ${pct}% del origen</div>
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function handleSankeyLinkMouseLeave() {
    svgSankey.selectAll(".sankey-link").classed("dimmed", false).classed("active", false);
    tooltip.transition().duration(100).style("opacity", 0);
}

function handleSankeyNodeMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    
    // Find percentage relative to root node (Total Noticias)
    const rootVal = svgSankey.selectAll(".sankey-node").data().find(n => n.node === 0)?.value || d.value;
    const pct = (d.value / rootVal * 100).toFixed(1);

    tooltip.html(`
        <div class="tooltip-title">${d.name}</div>
        <div class="tooltip-row"><strong>Total:</strong> ${Math.round(d.value).toLocaleString()} noticias</div>
        ${d.node !== 0 ? `<div class="tooltip-row"><strong>Proporción del total:</strong> ${pct}%</div>` : ''}
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function handleSankeyNodeMouseLeave() {
    tooltip.transition().duration(100).style("opacity", 0);
}

function bindSankeyEvents() {
    const buttons = document.querySelectorAll(".sankey-country-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const country = btn.getAttribute("data-country");
            if (!country || country === selectedSankeyCountry) return;

            buttons.forEach(b => b.classList.toggle("active", b === btn));
            selectedSankeyCountry = country;
            renderSankeyPlot(country);
        });
    });
}

function updateSankeyVisualization(stepIndex) {
    const countries = ["AR", "CL", "ES", "MX"];
    const targetCountry = countries[stepIndex];
    if (!targetCountry) return;

    selectedSankeyCountry = targetCountry;

    // Sync button state
    const buttons = document.querySelectorAll(".sankey-country-btn");
    buttons.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-country") === targetCountry);
    });

    renderSankeyPlot(targetCountry);
}

function initScrollamaSankey() {
    scrollerSankey
        .setup({
            step: "#scrolly-sankey article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            document.querySelectorAll("#scrolly-sankey article .step")
                .forEach((step, idx) => step.classList.toggle("is-active", idx === stepIndex));
            updateSankeyVisualization(stepIndex);
        });
    updateSankeyVisualization(0);
}



// ==========================================
// SECTION 7: LA BARRERA DE CRISTAL (Beeswarm)
// ==========================================

/**
 * Derive ISO country code from the country string in the data.
 */
function getCountryCode(countryStr) {
    const map = { "Chile": "CL", "Argentina": "AR", "Espana": "ES", "España": "ES", "Mexico": "MX", "México": "MX" };
    return map[countryStr] || countryStr.substring(0, 2).toUpperCase();
}

/**
 * Load and aggregate readability data. Files are double-serialized JSON strings.
 * Aggregates to one data point per media_name (median years_education + inflesz).
 */
function loadBeeswarmData() {
    const files = [
        "data/linguistic_characteristics/readability_per_country_and_media/news_chile_readability_per_media.json",
        "data/linguistic_characteristics/readability_per_country_and_media/news_argentina_readability_per_media.json",
        "data/linguistic_characteristics/readability_per_country_and_media/news_espana_readability_per_media.json",
        "data/linguistic_characteristics/readability_per_country_and_media/news_mexico_readability_per_media.json"
    ];

    return Promise.all(files.map(url => d3.text(url)))
        .then(rawTexts => {
            allBeeswarmData = [];

            rawTexts.forEach(raw => {
                // Double-parse: file contains a JSON-encoded string
                let data;
                try {
                    const firstParse = JSON.parse(raw);
                    data = typeof firstParse === "string" ? JSON.parse(firstParse) : firstParse;
                } catch(e) {
                    console.error("[Beeswarm] Failed to parse JSON:", e);
                    return;
                }

                // Group by media_name and aggregate
                const byMedia = d3.group(data, d => d.media_name);

                byMedia.forEach((records, mediaName) => {
                    // Filter valid numeric records
                    const validRecords = records.filter(d =>
                        d.years_education != null && !isNaN(+d.years_education) &&
                        d.inflesz_score != null && !isNaN(+d.inflesz_score)
                    );
                    if (validRecords.length === 0) return;

                    const sortedYears = validRecords.map(d => +d.years_education).sort(d3.ascending);
                    const sortedInflesz = validRecords.map(d => +d.inflesz_score).sort(d3.ascending);
                    const medianYears = d3.median(sortedYears);
                    const medianInflesz = d3.median(sortedInflesz);

                    // Pick the sample_text from the hardest-to-read article (highest years)
                    const hardest = validRecords.reduce((a, b) =>
                        +a.years_education >= +b.years_education ? a : b
                    );

                    const cCode = getCountryCode(records[0].country);

                    allBeeswarmData.push({
                        media_name: mediaName,
                        country: records[0].country,
                        countryCode: cCode,
                        years_education: medianYears,
                        inflesz_score: medianInflesz,
                        sample_text: hardest.sample_text || ""
                    });
                });
            });

            // Compute median years by country
            const byCountry = d3.group(allBeeswarmData, d => d.countryCode);
            byCountry.forEach((nodes, code) => {
                beeswarmMedianByCountry[code] = d3.median(nodes, d => d.years_education);
            });

            // Pre-compute storytelling text
            generateBeeswarmStorytelling();
        });
}

/**
 * Generate dynamic storytelling text for each country pair.
 */
function generateBeeswarmStorytelling() {
    const avgEducation = { "CL": 9.5, "AR": 9.5, "ES": 9.6, "MX": 9.8 }; // Approx national averages in years

    ["CL", "AR", "ES", "MX"].forEach(code => {
        const med = beeswarmMedianByCountry[code];
        if (!med) return;
        const countryFull = countryNames[code];
        const avg = avgEducation[code];
        const diff = (med - avg).toFixed(1);
        beeswarmStorytellingData[code] = {
            median: med.toFixed(1),
            countryFull,
            diff,
            text: `Noticias para pocos: La escolaridad promedio en ${countryFull} es de ~${avg} años, pero la prensa exige <strong>${med.toFixed(1)} años</strong> de educación formal para ser comprendida. Eso es <strong>${diff} años más</strong> de los que tiene la mayoría de la población. Una barrera invisible de lenguaje separa la información de quienes más la necesitan.`
        };
    });

    // Inject CL vs AR insight
    const elCL = document.getElementById("beeswarm-insight-CL-AR");
    if (elCL && beeswarmStorytellingData["CL"] && beeswarmStorytellingData["AR"]) {
        const cl = beeswarmStorytellingData["CL"];
        const ar = beeswarmStorytellingData["AR"];
        elCL.innerHTML = `
            <p><strong>Chile</strong>: ${cl.text}</p>
            <p style="margin-top:0.8rem"><strong>Argentina</strong>: ${ar.text}</p>
        `;
    }

    // Inject ES vs MX insight
    const elES = document.getElementById("beeswarm-insight-ES-MX");
    if (elES && beeswarmStorytellingData["ES"] && beeswarmStorytellingData["MX"]) {
        const es = beeswarmStorytellingData["ES"];
        const mx = beeswarmStorytellingData["MX"];
        elES.innerHTML = `
            <p><strong>España</strong>: ${es.text}</p>
            <p style="margin-top:0.8rem"><strong>México</strong>: ${mx.text}</p>
        `;
    }

    // Inject storytelling cards in the sticky panel
    const panel = document.getElementById("storytelling-insights-beeswarm");
    if (panel) {
        const cards = ["CL", "AR", "ES", "MX"].map(code => {
            const d = beeswarmStorytellingData[code];
            if (!d) return "";
            const color = { CL: "var(--color-cl)", AR: "var(--color-ar)", ES: "var(--color-es)", MX: "var(--color-mx)" }[code];
            return `<div class="insight-card country-border-${code.toLowerCase()}">
                <div class="insight-country" style="color:${color}">${d.countryFull}</div>
                <div class="insight-stat">${d.median} años</div>
                <div class="insight-label">de escolaridad exigidos (mediana)</div>
            </div>`;
        }).join("");
        panel.innerHTML = `<div class="insights-grid">${cards}</div>`;
    }
}

/**
 * Set up SVG, draw background zones, axis, and render the pre-cooled beeswarm.
 */
function setupD3BeeswarmCanvas() {
    const canvas = document.getElementById("d3-canvas-beeswarm");
    if (!canvas || allBeeswarmData.length === 0) return;

    canvas.innerHTML = "";
    widthBeeswarm = canvas.clientWidth;
    heightBeeswarm = canvas.clientHeight;

    svgBeeswarm = d3.select(canvas)
        .append("svg")
        .attr("width", widthBeeswarm)
        .attr("height", heightBeeswarm)
        .attr("viewBox", `0 0 ${widthBeeswarm} ${heightBeeswarm}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Y scale: 6 (bottom) → 20 (top)
    yScaleBeeswarm = d3.scaleLinear()
        .domain([6, 20])
        .range([heightBeeswarm - paddingBeeswarm.bottom, paddingBeeswarm.top]);

    // Background zones
    const zones = [
        { class: "beeswarm-zone-basica", label: "BÁSICA",       yMin: 6,  yMax: 9 },
        { class: "beeswarm-zone-media",  label: "MEDIA",        yMin: 9,  yMax: 12 },
        { class: "beeswarm-zone-univ",   label: "UNIVERSITARIA", yMin: 12, yMax: 20 }
    ];

    zones.forEach(z => {
        const yTop    = yScaleBeeswarm(z.yMax);
        const yBottom = yScaleBeeswarm(z.yMin);
        svgBeeswarm.append("rect")
            .attr("class", z.class)
            .attr("x", paddingBeeswarm.left)
            .attr("y", yTop)
            .attr("width", widthBeeswarm - paddingBeeswarm.left - paddingBeeswarm.right)
            .attr("height", yBottom - yTop);

        svgBeeswarm.append("text")
            .attr("class", "beeswarm-zone-label")
            .attr("x", widthBeeswarm - paddingBeeswarm.right - 4)
            .attr("y", yTop + 14)
            .attr("text-anchor", "end")
            .text(z.label);
    });

    // Y Axis
    const yAxis = d3.axisLeft(yScaleBeeswarm)
        .ticks(8)
        .tickFormat(d => `${d} años`);

    svgBeeswarm.append("g")
        .attr("class", "beeswarm-axis")
        .attr("transform", `translate(${paddingBeeswarm.left}, 0)`)
        .call(yAxis);

    // Axis label
    svgBeeswarm.append("text")
        .attr("class", "beeswarm-zone-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(heightBeeswarm / 2))
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .text("AÑOS DE EDUCACIÓN REQUERIDOS");

    renderBeeswarmPlot();
}

/**
 * Run the force simulation offline (pre-cool), then render circles at final positions.
 */
function renderBeeswarmPlot() {
    if (!svgBeeswarm || allBeeswarmData.length === 0) return;

    // Remove existing circles and median elements
    svgBeeswarm.selectAll(".bee-circle").remove();
    svgBeeswarm.selectAll(".beeswarm-median-line").remove();
    svgBeeswarm.selectAll(".beeswarm-median-label").remove();

    const cx = (widthBeeswarm + paddingBeeswarm.left) / 2;

    // Clone nodes to avoid mutating allBeeswarmData
    const nodes = allBeeswarmData.map(d => Object.assign({}, d));

    // Pre-cool the simulation — 300 ticks before DOM insertion
    const sim = d3.forceSimulation(nodes)
        .force("y", d3.forceY(d => yScaleBeeswarm(d.years_education)).strength(1.0))
        .force("x", d3.forceX(cx).strength(0.04))
        .force("collide", d3.forceCollide(7.5).strength(1))
        .stop();

    for (let i = 0; i < 300; i++) sim.tick();

    // Clamp circles within canvas bounds
    const r = 7;
    nodes.forEach(d => {
        d.x = Math.max(paddingBeeswarm.left + r, Math.min(widthBeeswarm - paddingBeeswarm.right - r, d.x));
        d.y = Math.max(paddingBeeswarm.top + r, Math.min(heightBeeswarm - paddingBeeswarm.bottom - r, d.y));
    });

    // Draw circles
    svgBeeswarm.selectAll(".bee-circle")
        .data(nodes, d => d.media_name + "_" + d.countryCode)
        .join("circle")
        .attr("class", "bee-circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", r)
        .attr("fill", d => {
            switch (d.countryCode) {
                case "AR": return "var(--color-ar)";
                case "CL": return "var(--color-cl)";
                case "ES": return "var(--color-es)";
                case "MX": return "var(--color-mx)";
                default:   return "#999";
            }
        })
        .style("opacity", 0.82)
        .on("mouseover", handleBeeswarmMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleBeeswarmMouseLeave);

    // Draw median lines (one per country, hidden by default)
    ["CL", "AR", "ES", "MX"].forEach(code => {
        const med = beeswarmMedianByCountry[code];
        if (!med) return;
        const y = yScaleBeeswarm(med);
        const color = { CL: "var(--color-cl)", AR: "var(--color-ar)", ES: "var(--color-es)", MX: "var(--color-mx)" }[code];

        svgBeeswarm.append("line")
            .attr("class", "beeswarm-median-line")
            .attr("data-country", code)
            .attr("x1", paddingBeeswarm.left + 4)
            .attr("x2", widthBeeswarm - paddingBeeswarm.right - 4)
            .attr("y1", y)
            .attr("y2", y)
            .attr("stroke", color);

        svgBeeswarm.append("text")
            .attr("class", "beeswarm-median-label")
            .attr("data-country", code)
            .attr("x", widthBeeswarm - paddingBeeswarm.right - 6)
            .attr("y", y - 4)
            .attr("text-anchor", "end")
            .attr("fill", color)
            .text(`${countryNames[code]}: ${med.toFixed(1)} años`);
    });

    // Apply initial state (step 0 = all visible)
    updateBeeswarmVisualization(0);
}

/**
 * Tooltip mouse-over handler for beeswarm circles.
 */
function handleBeeswarmMouseOver(event, d) {
    tooltip.transition().duration(100).style("opacity", 0.96);
    const isUniv = d.years_education >= 12;
    const sampleHtml = isUniv && d.sample_text
        ? `<div class="tooltip-sample-text">"${d.sample_text.substring(0, 260)}…"</div>`
        : "";
    tooltip.html(`
        <div class="tooltip-title">${d.media_name}</div>
        <div class="tooltip-row"><strong>País:</strong> ${countryNames[d.countryCode] || d.country}</div>
        <div class="tooltip-row"><strong>Años requeridos:</strong> ${d.years_education.toFixed(1)}</div>
        <div class="tooltip-row"><strong>INFLESZ:</strong> ${d.inflesz_score.toFixed(1)}</div>
        ${sampleHtml}
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function handleBeeswarmMouseLeave() {
    tooltip.transition().duration(100).style("opacity", 0);
}

/**
 * Update beeswarm visualization state based on scrollama step index.
 */
function updateBeeswarmVisualization(stepIndex) {
    if (!svgBeeswarm) return;

    const circles = svgBeeswarm.selectAll(".bee-circle");
    const medianLines = svgBeeswarm.selectAll(".beeswarm-median-line");
    const medianLabels = svgBeeswarm.selectAll(".beeswarm-median-label");

    if (stepIndex === 0) {
        // Overview: all visible, no median lines
        circles.classed("dimmed", false).classed("highlighted", false)
               .style("opacity", 0.82);
        medianLines.classed("visible", false);
        medianLabels.classed("visible", false);

    } else if (stepIndex === 1) {
        // Chile vs Argentina
        const focus = new Set(["CL", "AR"]);
        circles
            .style("opacity", d => focus.has(d.countryCode) ? 0.88 : 0.07)
            .classed("dimmed", d => !focus.has(d.countryCode))
            .classed("highlighted", d => focus.has(d.countryCode));
        medianLines
            .classed("visible", function() { return focus.has(d3.select(this).attr("data-country")); });
        medianLabels
            .classed("visible", function() { return focus.has(d3.select(this).attr("data-country")); });

    } else if (stepIndex === 2) {
        // España vs México
        const focus = new Set(["ES", "MX"]);
        circles
            .style("opacity", d => focus.has(d.countryCode) ? 0.88 : 0.07)
            .classed("dimmed", d => !focus.has(d.countryCode))
            .classed("highlighted", d => focus.has(d.countryCode));
        medianLines
            .classed("visible", function() { return focus.has(d3.select(this).attr("data-country")); });
        medianLabels
            .classed("visible", function() { return focus.has(d3.select(this).attr("data-country")); });

    } else if (stepIndex === 3) {
        // University zone only
        circles
            .style("opacity", d => d.years_education >= 12 ? 0.92 : 0.06)
            .classed("dimmed", d => d.years_education < 12)
            .classed("highlighted", d => d.years_education >= 12);
        medianLines.classed("visible", true);
        medianLabels.classed("visible", true);
    }
}

/**
 * Initialize Scrollama for Section 7.
 */
function initScrollamaBeeswarm() {
    scrollerBeeswarm
        .setup({
            step: "#scrolly-beeswarm article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(response => {
            const stepIndex = response.index;
            document.querySelectorAll("#scrolly-beeswarm article .step")
                .forEach((step, idx) => step.classList.toggle("is-active", idx === stepIndex));
            updateBeeswarmVisualization(stepIndex);
        });
    updateBeeswarmVisualization(0);
}
