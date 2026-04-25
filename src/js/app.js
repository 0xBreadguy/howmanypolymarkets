const polymarketGasPerSec = 11;
const MatterLib = window.Matter;

const selector = document.getElementById('selector');
const tableBody = document.getElementById('tableBody');
const instancesEl = document.getElementById('instances');
const gasPerSecEl = document.getElementById('gasPerSec');
const fullInstancesEl = document.getElementById('fullInstances');
const fractionEl = document.getElementById('fraction');
const descriptionEl = document.getElementById('description');
const metricLabelEl = document.getElementById('metricLabel');
const metricDeltaEl = document.getElementById('metricDelta');
const selectedChainLineEl = document.getElementById('selectedChainLine');
const vizSummaryEl = document.getElementById('vizSummary');
const physicsBox = document.getElementById('physicsBox');

let chains = [];
let activeChain = null;
let engine;
let render;
let runner;
let boundaries = [];
let tokenBodies = [];

function formatInstances(value) {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1);
}

function getDescription(chain) {
  if (chain.instances >= 100) {
    return `${chain.name} has absurd headroom — enough room for a whole tower of Polymarkets running in parallel.`;
  }
  if (chain.instances >= 10) {
    return `${chain.name} can comfortably host many full Polymarket-scale apps at once, with room to spare.`;
  }
  if (chain.instances >= 1) {
    return `${chain.name} can support at least one full Polymarket-equivalent, plus some extra throughput on top.`;
  }
  return `${chain.name} does not reach a full Polymarket at this throughput target — it only covers part of one.`;
}

function initials(name) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function logoMarkup(chain, className) {
  if (chain.logo) {
    return `<img class="${className}" src="${chain.logo}" alt="${chain.name} logo" />`;
  }
  return `<div class="${className} placeholder" aria-hidden="true">${initials(chain.name)}</div>`;
}

function renderSelector() {
  selector.innerHTML = '';
  chains.forEach(chain => {
    const button = document.createElement('button');
    button.className = 'toggle-btn' + (chain.name === activeChain.name ? ' active' : '');
    button.innerHTML = `
      ${logoMarkup(chain, 'chain-logo')}
      <div class="chain-copy">
        <span class="chain-name">${chain.name}</span>
        <span class="chain-meta">${formatInstances(chain.instances)}x Polymarkets</span>
      </div>
    `;
    button.addEventListener('click', () => {
      if (activeChain?.name === chain.name) return;
      activeChain = chain;
      renderAll(true);
    });
    selector.appendChild(button);
  });
}

function renderTable() {
  tableBody.innerHTML = '';
  chains.forEach(chain => {
    const tr = document.createElement('tr');
    if (chain.name === activeChain.name) tr.className = 'row-active';
    tr.innerHTML = `
      <td>
        <div class="table-chain">
          ${logoMarkup(chain, 'table-logo')}
          <strong>${chain.name}</strong>
        </div>
      </td>
      <td>${chain.execBlockTime}</td>
      <td>${chain.metadataBlock}</td>
      <td>${chain.gasLimitPerBlock}</td>
      <td>${chain.gasPerSec}M</td>
      <td>${chain.instances.toFixed(2)}x</td>
    `;
    tr.addEventListener('click', () => {
      if (activeChain?.name === chain.name) return;
      activeChain = chain;
      renderAll(true);
    });
    tableBody.appendChild(tr);
  });
}

function animateMetric() {
  instancesEl.classList.remove('updating');
  void instancesEl.offsetWidth;
  instancesEl.classList.add('updating');
  setTimeout(() => instancesEl.classList.remove('updating'), 180);
}

function setupPhysics() {
  const { Engine, Render, Runner, Bodies, Composite } = MatterLib;
  const width = physicsBox.clientWidth;
  const height = physicsBox.clientHeight;

  physicsBox.innerHTML = '';

  engine = Engine.create({
    gravity: { x: 0, y: 1.1 },
    positionIterations: 8,
    velocityIterations: 6,
    constraintIterations: 4,
  });

  render = Render.create({
    element: physicsBox,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio || 1,
    },
  });

  runner = Runner.create();
  Render.run(render);
  Runner.run(runner, engine);

  const wallThickness = 120;
  boundaries = [
    Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true, render: { visible: false } }),
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, render: { visible: false } }),
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, render: { visible: false } }),
  ];

  Composite.add(engine.world, boundaries);
}

function clearTokens() {
  if (!engine) return;
  const { Composite } = MatterLib;
  Composite.remove(engine.world, tokenBodies);
  tokenBodies = [];
}

function buildPile(chain) {
  if (!engine) return;
  clearTokens();

  const { Bodies, Composite } = MatterLib;
  const width = physicsBox.clientWidth;
  const height = physicsBox.clientHeight;
  const baseCount = Math.max(chain.fullInstances, 1);
  const tokenSize = width < 700 ? 14 : 16;
  const logoPath = './assets/brand/polymarket-logo.jpg';

  for (let i = 0; i < baseCount; i++) {
    const body = Bodies.rectangle(
      40 + Math.random() * Math.max(width - 80, 40),
      -40 - (i * 10),
      tokenSize,
      tokenSize,
      {
        restitution: 0.05,
        friction: 0.95,
        frictionStatic: 0.9,
        frictionAir: 0.02,
        density: 0.0022,
        chamfer: { radius: 4 },
        slop: 0.01,
        angle: (Math.random() - 0.5) * 0.12,
        render: {
          sprite: {
            texture: logoPath,
            xScale: tokenSize / 64,
            yScale: tokenSize / 64,
          },
        },
      }
    );
    tokenBodies.push(body);
  }

  if (chain.fraction > 0.08) {
    const partial = Bodies.rectangle(
      width * 0.5,
      -120,
      tokenSize,
      tokenSize,
      {
        restitution: 0.05,
        friction: 0.95,
        frictionStatic: 0.9,
        frictionAir: 0.02,
        density: 0.0022,
        chamfer: { radius: 4 },
        slop: 0.01,
        angle: -0.08,
        render: {
          opacity: 0.4,
          sprite: {
            texture: logoPath,
            xScale: tokenSize / 64,
            yScale: tokenSize / 64,
          },
        },
      }
    );
    tokenBodies.push(partial);
  }

  Composite.add(engine.world, tokenBodies);
  vizSummaryEl.textContent = `${chain.fullInstances}${chain.fraction > 0.08 ? ' + partial' : ''} logos in pile`;
}

function renderStats(chain, withMotion = false) {
  if (withMotion) animateMetric();
  instancesEl.textContent = `${formatInstances(chain.instances)}x`;
  metricLabelEl.textContent = `Polymarkets on ${chain.name}`;
  metricDeltaEl.textContent = chain.instances >= 1 ? 'can fit at once' : 'of one Polymarket';
  selectedChainLineEl.textContent = `${chain.gasPerSec}M gas/sec on ${chain.name}`;
  gasPerSecEl.textContent = `${chain.gasPerSec}M`;
  fullInstancesEl.textContent = String(chain.fullInstances);
  fractionEl.textContent = `${Math.round(chain.fraction * 100)}%`;
  descriptionEl.textContent = getDescription(chain);
}

function renderAll(withMotion = false) {
  renderSelector();
  renderStats(activeChain, withMotion);
  renderTable();
  buildPile(activeChain);
}

window.addEventListener('resize', () => {
  if (!activeChain) return;
  if (render) {
    MatterLib.Render.stop(render);
    MatterLib.Runner.stop(runner);
  }
  setupPhysics();
  buildPile(activeChain);
});

async function init() {
  const response = await fetch('./data/chains.json');
  const rawChains = await response.json();

  chains = rawChains.map(chain => {
    const instances = chain.gasPerSec / polymarketGasPerSec;
    const fullInstances = Math.floor(instances);
    const fraction = instances - fullInstances;
    return {
      ...chain,
      instances,
      fullInstances,
      fraction,
    };
  });

  setupPhysics();
  activeChain = chains[0];
  renderAll(false);
}

init().catch(error => {
  console.error('Failed to initialize site', error);
  descriptionEl.textContent = 'Failed to load chain data.';
});
