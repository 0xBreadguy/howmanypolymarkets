const polymarketGasPerSec = 11;

const selector = document.getElementById('selector');
const stack = document.getElementById('stack');
const tableBody = document.getElementById('tableBody');
const instancesEl = document.getElementById('instances');
const gasPerSecEl = document.getElementById('gasPerSec');
const fullInstancesEl = document.getElementById('fullInstances');
const fractionEl = document.getElementById('fraction');
const descriptionEl = document.getElementById('description');
const eyebrowChainEl = document.getElementById('eyebrowChain');
const vizSummaryEl = document.getElementById('vizSummary');
const statPanel = document.getElementById('statPanel');
const selectedChainLogo = document.getElementById('selectedChainLogo');

let chains = [];
let activeChain = null;

function formatInstances(value) {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1);
}

function getDescription(chain) {
  if (chain.instances >= 100) {
    return `${chain.name} has absurd headroom here — enough room for a whole tower of Polymarkets running in parallel.`;
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
    button.className = 'chain-btn' + (chain.name === activeChain.name ? ' active' : '');
    button.style.setProperty('--accent', chain.accent);
    button.innerHTML = `
      ${logoMarkup(chain, 'chain-logo')}
      <div class="chain-copy">
        <span class="chain-name">${chain.name}</span>
        <span class="chain-meta">${chain.gasPerSec}M gas/sec • ${formatInstances(chain.instances)}x</span>
      </div>
    `;
    button.addEventListener('click', () => {
      activeChain = chain;
      renderAll();
    });
    selector.appendChild(button);
  });
}

function renderStack(chain) {
  stack.innerHTML = '';
  const totalCards = Math.min(chain.fullInstances + (chain.fraction > 0 ? 1 : 0), 48);
  const overflow = (chain.fullInstances + (chain.fraction > 0 ? 1 : 0)) - totalCards;

  for (let i = 0; i < totalCards; i++) {
    const isPartial = i === totalCards - 1 && chain.fraction > 0 && i >= chain.fullInstances;
    const fill = isPartial ? Math.max(chain.fraction, 0.12) : 1;
    const div = document.createElement('div');
    div.className = 'market' + (isPartial ? ' partial' : '');
    div.style.setProperty('--accent', chain.accent);
    div.style.setProperty('--fill', fill);
    div.style.animationDelay = `${Math.min(i * 16, 280)}ms`;
    div.innerHTML = `
      <div class="market-inner">
        <div class="market-top">
          <span class="tag">Polymarket</span>
          ${logoMarkup(chain, 'market-logo')}
        </div>
        <strong>${isPartial ? Math.round(chain.fraction * 100) + '% of one' : 'Full instance'}</strong>
      </div>
    `;
    stack.appendChild(div);
  }

  if (overflow > 0) {
    const more = document.createElement('div');
    more.className = 'market';
    more.style.setProperty('--accent', chain.accent);
    more.style.setProperty('--fill', 0.18);
    more.innerHTML = `
      <div class="market-inner">
        <div class="market-top">
          <span class="tag">+${overflow}</span>
          ${logoMarkup(chain, 'market-logo')}
        </div>
        <strong>more beyond the visible stack</strong>
      </div>
    `;
    stack.appendChild(more);
  }

  const rawVisible = totalCards + (overflow > 0 ? 1 : 0);
  vizSummaryEl.textContent = `${rawVisible} card${rawVisible === 1 ? '' : 's'} shown`;
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
      activeChain = chain;
      renderAll();
    });
    tableBody.appendChild(tr);
  });
}

function renderStats(chain) {
  instancesEl.textContent = `${formatInstances(chain.instances)}x`;
  gasPerSecEl.textContent = `${chain.gasPerSec}M`;
  fullInstancesEl.textContent = String(chain.fullInstances);
  fractionEl.textContent = `${Math.round(chain.fraction * 100)}%`;
  descriptionEl.textContent = getDescription(chain);
  eyebrowChainEl.textContent = chain.name;
  statPanel.style.setProperty('--accent', chain.accent);
  selectedChainLogo.innerHTML = logoMarkup(chain, 'selected-logo-img');
}

function renderAll() {
  renderSelector();
  renderStats(activeChain);
  renderStack(activeChain);
  renderTable();
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
  renderAll();
}

init().catch(error => {
  console.error('Failed to initialize site', error);
  descriptionEl.textContent = 'Failed to load chain data.';
});
