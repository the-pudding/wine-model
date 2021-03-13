// External libs.
import { forceLink, forceManyBody, forceX, forceY } from 'd3-force';

// Internal modules.
import state from '../app/state';
import { sim, tweenStatsAlpha } from './stats';

// Individual simulations:

// Move to the globe's exit position.
const xPosGlobe = forceX(d => d.layout.globeExit.x).strength(0.1);
const yPosGlobe = forceY(d => d.layout.globeExit.y).strength(0.1);

function simulateGlobePosition() {
  // Configure and start simulation.
  sim
    .nodes(state.stats.data)
    .force('chargeLattice', null)
    .force('link', null)
    .force('xCentre', null)
    .force('yCentre', null)
    .force('xGlobe', xPosGlobe)
    .force('yGlobe', yPosGlobe)
    .alpha(0.8)
    .restart();

  // Switch the global alpha off.
  tweenStatsAlpha(0);
}

// Move to lattice.
const chargeLattice = forceManyBody().strength(-6);
const xPosCentre = forceX(() => state.width / 2).strength(0.05); // 1
const yPosCentre = forceY(() => state.height / 2).strength(0.05);

function simulateLattice() {
  // Set the current variable value to null.
  // This is not a frequency distribution.
  state.stats.current = [];

  // This ↓ can't be in module scope with its force friends,
  // as it needs to be run after the links are produced.
  const linkForce = forceLink(state.stats.links)
    .id(d => d.index)
    .strength(1)
    .distance(1)
    .iterations(15);

  // Configure and start simulation.
  sim
    .nodes(state.stats.data)
    .force('link', linkForce)
    .force('chargeLattice', chargeLattice)
    .force('chargeFrequencies', null)
    .force('xGlobe', null)
    .force('yGlobe', null)
    .force('xCentre', xPosCentre)
    .force('yCentre', yPosCentre)
    .force('xAlcohol', null)
    .force('yAlcohol', null)
    .alpha(0.8)
    .restart();

  // Switch the global alpha on.
  state.stats.alpha.value = 1;
}

// Move to Alcohol frequency.
const chargeFrequencies = forceManyBody().strength(-2);
const xPosAlcohol = forceX(d => d.layout.alcohol.x).strength(0.5);
const yPosAlcohol = forceY(d => d.layout.alcohol.y).strength(0.5);

function simulateAlcohol() {
  state.stats.current = [
    { name: 'alcohol', axis: 'x', straight: false, header: true, label: false },
  ];

  // This sim is triggered on multiple occasions.
  sim
    .nodes(state.stats.data)
    .force('link', null)
    .force('chargeLattice', null)
    .force('xCentre', null)
    .force('yCentre', null)
    .force('chargeFrequencies', chargeFrequencies)
    .force('chargeScatter', null)
    .force('xQuality', null)
    .force('yQuality', null)
    .force('xPosQualAlc', null)
    .force('yPosQualAlc', null)
    .force('xAlcohol', xPosAlcohol)
    .force('yAlcohol', yPosAlcohol)
    .force('xPosQualVol', null)
    .force('yPosQualVol', null)
    .force('xDensity', null)
    .force('yDensity', null)
    .alpha(0.8)
    .restart();
}

// Move to Density frequency.
const xPosDensity = forceX(d => d.layout.density.x).strength(0.5);
const yPosDensity = forceY(d => d.layout.density.y).strength(0.5);

function simulateDensity() {
  state.stats.current = [
    { name: 'density', axis: 'x', straight: false, header: true, label: false },
  ];

  sim
    .nodes(state.stats.data)
    .force('xAlcohol', null)
    .force('yAlcohol', null)
    .force('xDensity', xPosDensity)
    .force('yDensity', yPosDensity)
    .force('xFixed', null)
    .force('yFixed', null)
    .alpha(0.8)
    .restart();
}

// Move to Fixed Acidity frequency.
const xPosFixed = forceX(d => d.layout.fixed_acidity.x).strength(0.5);
const yPosFixed = forceY(d => d.layout.fixed_acidity.y).strength(0.5);

function simulateFixed() {
  state.stats.current = [
    {
      name: 'fixed_acidity',
      axis: 'x',
      straight: false,
      header: true,
      label: false,
    },
  ];

  sim
    .nodes(state.stats.data)
    .force('xDensity', null)
    .force('yDensity', null)
    .force('xFixed', xPosFixed)
    .force('yFixed', yPosFixed)
    .force('xPh', null)
    .force('yPh', null)
    .alpha(0.8)
    .restart();
}

// Move to pH frequency.
const xPosPh = forceX(d => d.layout.ph.x).strength(0.5);
const yPosPh = forceY(d => d.layout.ph.y).strength(0.5);

function simulatePh() {
  state.stats.current = [
    { name: 'ph', axis: 'x', straight: false, header: true, label: false },
  ];

  sim
    .nodes(state.stats.data)
    .force('xFixed', null)
    .force('yFixed', null)
    .force('xPh', xPosPh)
    .force('yPh', yPosPh)
    .force('xVolatile', null)
    .force('yVolatile', null)
    .alpha(0.8)
    .restart();
}

// Move to Volatile Acidity frequency.
const xPosVolatile = forceX(d => d.layout.volatile_acidity.x).strength(0.5);
const yPosVolatile = forceY(d => d.layout.volatile_acidity.y).strength(0.5);

function simulateVolatile() {
  state.stats.current = [
    {
      name: 'volatile_acidity',
      axis: 'x',
      straight: false,
      header: true,
      label: false,
    },
  ];

  sim
    .nodes(state.stats.data)
    .force('xPh', null)
    .force('yPh', null)
    .force('xQuality', null)
    .force('yQuality', null)
    .force('xVolatile', xPosVolatile)
    .force('yVolatile', yPosVolatile)
    .force('chargeFrequencies', chargeFrequencies)
    .force('chargeScatter', null)
    .force('xPosQualVol', null)
    .force('yPosQualVol', null)
    .alpha(0.8)
    .restart();
}
// Move to Quality frequency.
const xPosQuality = forceX(d => d.layout.quality.x).strength(0.5);
const yPosQuality = forceY(d => d.layout.quality.y).strength(0.5);

function simulateQuality() {
  state.stats.current = [
    { name: 'quality', axis: 'x', straight: false, header: true, label: false },
  ];

  sim
    .nodes(state.stats.data)
    .force('xVolatile', null)
    .force('yVolatile', null)
    .force('xQuality', xPosQuality)
    .force('yQuality', yPosQuality)
    .force('xAlcohol', null)
    .force('yAlcohol', null)
    .alpha(0.8)
    .restart();
}

export {
  simulateGlobePosition,
  simulateLattice,
  simulateAlcohol,
  simulateDensity,
  simulateFixed,
  simulatePh,
  simulateVolatile,
  simulateQuality,
};

// 1. Not using `forceCenter` here as v 1.2.1 (the ES5 version) doesn't
//    have a `strangth` setter yet. So I am implementing my own centre
//    force here.
