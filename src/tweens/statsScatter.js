// External libs.
import { forceManyBody, forceX, forceY } from 'd3-force';

// Internal modules.
import state from '../app/state';
import { sim, boundingBox, tweenStatsAlpha } from './stats';

// Individual simulations:

// Move to Alcohol scatter.
const chargeScatter = forceManyBody().strength(-1);
const xPosQualAlc = forceX(d => d.layout.alcohol__quality.x).strength(0.3);
const yPosQualAlc = forceY(d => d.layout.alcohol__quality.y).strength(0.3);

function simulateQualAlc() {
  state.stats.current = [
    { name: 'alcohol', axis: 'x', straight: true, header: false, label: true },
    { name: 'quality', axis: 'y', straight: true, header: false, label: true },
  ];

  sim
    .nodes(state.stats.data)
    .force('chargeFrequencies', null)
    .force('chargeScatter', chargeScatter)
    .force('xAlcohol', null)
    .force('yAlcohol', null)
    .force('xPosQualAlc', xPosQualAlc)
    .force('yPosQualAlc', yPosQualAlc)
    .force('xPosQualVol', null)
    .force('yPosQualVol', null)
    .force('xPosQualBinAlc', null)
    .force('yPosQualBinAlc', null)
    .alpha(0.8)
    .restart();
}

// Move to Volatile Acidity scatter.
const xPosQualVol = forceX(d => d.layout.vol_acid__quality.x).strength(0.3);
const yPosQualVol = forceY(d => d.layout.vol_acid__quality.y).strength(0.3);

function simulateQualVol() {
  state.stats.current = [
    {
      name: 'volatile_acidity',
      axis: 'x',
      straight: true,
      header: false,
      label: true,
    },
    { name: 'quality', axis: 'y', straight: true, header: false, label: true },
  ];

  sim
    .nodes(state.stats.data)
    .force('chargeFrequencies', null)
    .force('chargeScatter', chargeScatter)
    .force('xPosQualVol', xPosQualVol)
    .force('yPosQualVol', yPosQualVol)
    .force('xVolatile', null)
    .force('yVolatile', null)
    .force('xAlcohol', null)
    .force('yAlcohol', null)
    .alpha(0.8)
    .restart();
}

// Move to Volatile Acidity scatter.
const xPosQualBinAlc = forceX(d => d.layout.alcohol__quality_binary.x).strength(
  0.3
);
const yPosQualBinAlc = forceY(d => d.layout.alcohol__quality_binary.y).strength(
  0.3
);

function simulateQualBinAlc() {
  state.stats.current = [
    {
      name: 'alcohol',
      axis: 'x',
      straight: true,
      header: false,
      label: true,
    },
    {
      name: 'quality_binary',
      axis: 'y',
      straight: true,
      header: false,
      label: true,
    },
  ];

  sim
    .nodes(state.stats.data)
    .force('chargeScatter', chargeScatter)
    .force('boxForce', boundingBox)
    .force('xPosQualAlc', null)
    .force('yPosQualAlc', null)
    .force('xPosQualVol', null)
    .force('yPosQualVol', null)
    .force('xPosQualBinAlc', xPosQualBinAlc)
    .force('yPosQualBinAlc', yPosQualBinAlc)
    .force('chargeRemove', null)
    .alpha(0.8)
    .restart();
}

const chargeRemove = forceManyBody().strength(-4);

function simulateRemove() {
  sim
    .nodes(state.stats.data)
    .force('chargeScatter', null)
    .force('boxForce', null)
    .force('xPosQualBinAlc', null)
    .force('yPosQualBinAlc', null)
    .force('chargeRemove', chargeRemove)
    .alpha(0.8)
    .restart();

  // Switch the global alpha off.
  tweenStatsAlpha(0, 1);
}

export { simulateQualAlc, simulateQualVol, simulateQualBinAlc, simulateRemove };
