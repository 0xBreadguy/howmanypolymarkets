const polymarketGasPerSec = 11;
const visibleRainCap = 42;

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
const rainLayer = document.getElementById('rainLayer');

let chains = [];
let activeChain = null;

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

function clearRain() {
  rainLayer.innerHTML = '';
}

function triggerRain(chain) {
  clearRain();
  const logoPath = './assets/brand/polymarket-logo.jpg';
  const count = Math.min(Math.max(Math.round(chain.instances), 1), visibleRainCap);
  const overflow = Math.max(0, Math.round(chain.instances) - count);

  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.className = 'rain-logo';
    img.src = logoPath;
    img.alt = '';
    img.style.left = `${Math.random() * 100}%`;
    img.style.setProperty('--dur', `${1400 + Math.random() * 1200}ms`);
    img.style.setProperty('--rot', `${-18 + Math.random() * 36}deg`);
    img.style.animationDelay = `${Math.random() * 300}ms`;
    rainLayer.appendChild(img);
    setTimeout(() => img.remove(), 3200);
  }

  vizSummaryEl.textContent = overflow > 0
    ? `${count}+ logos raining`
    : `${count} logos raining`;
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
  if (withMotion) triggerRain(activeChain);
}

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

  activeChain = chains[0];
  renderAll(false);
  triggerRain(activeChain);
}

init().catch(error => {
  console.error('Failed to initialize site', error);
  descriptionEl.textContent = 'Failed to load chain data.';
});
