/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { scaleLinear } from 'd3-scale';
import cloneDeep from 'lodash.clonedeep';

import { range } from 'd3-array/src';
import state from '../app/state';

import gridLayout from '../layouts/grid';
import { getGradient, isMobile } from '../app/utils';

const smallBottleScale = isMobile() ? 0.1 : 0.15;
let xScale;
let yScale;
let gradientGood;
let gradientBad;

// Helper functions.
function getBaseData(rows, cols) {
  return range(rows * cols).map((d, i) => ({
    quality: Math.random() < 0.3,
    index: i,
  }));
}

function setScales() {
  // Get scales (also determining the space for our visual)
  const xBottleCorrection =
    (state.glassBottle.bottleBox.width / 2) * smallBottleScale;
  const yBottleCorrection =
    (state.glassBottle.bottleBox.height / 2) * smallBottleScale;

  const topFactor = isMobile() ? 0.2 : 0.1;

  xScale = scaleLinear().range([
    state.width * 0.1 - xBottleCorrection,
    state.width * 0.9 - xBottleCorrection,
  ]);
  yScale = scaleLinear().range([
    state.height * topFactor - yBottleCorrection,
    state.height * 0.9 - yBottleCorrection,
  ]);
}

function prepData() {
  // Base Data.
  const num = 10;
  state.bottleGrid.baseData = getBaseData(num, num);

  // Target data with layout.
  state.bottleGrid.dataTarget = gridLayout()
    .rows(num)
    .cols(num)
    .scale(smallBottleScale)(state.bottleGrid.baseData);

  // Origin data with layout.
  state.bottleGrid.dataOrigin = state.bottleGrid.dataTarget.map(d =>
    cloneDeep(d)
  );
  state.bottleGrid.dataOrigin.forEach(d => {
    d.layout.y = -0.2;
    d.layout.scale = 0;
  });

  // Add the initial position of the main bottle.
  state.bottleGrid.dataOrigin[0].layout.x = xScale.invert(
    state.transform.bottle.x
  );
  state.bottleGrid.dataOrigin[0].layout.y = yScale.invert(
    state.transform.bottle.y
  );
  state.bottleGrid.dataOrigin[0].layout.scale = state.transform.bottle.scale;

  // Sorted data (prep for sorted tween - this is complex!).
  // 1. Clone the base data and sort it by high - low quality.
  const sortedBaseData = state.bottleGrid.baseData
    .map(d => cloneDeep(d))
    .sort((a, b) => b.quality - a.quality);

  // 2. Augment it with an updated layout.
  state.bottleGrid.dataSorted = gridLayout()
    .rows(num)
    .cols(num)
    .scale(smallBottleScale)(sortedBaseData);

  // 3. Sort it into their original position.
  // Now we have the elements in orginal order
  // but the layout objects are sorted by quality.
  state.bottleGrid.dataSorted.sort((a, b) => a.index - b.index);

  // Exit positions (out data).
  state.bottleGrid.dataOut = state.bottleGrid.dataTarget.map(d => cloneDeep(d));
  state.bottleGrid.dataOut.forEach(d => {
    d.layout.y = -0.2;
    d.layout.scale = 0;
  });
}

// Drawing functions.
function drawBottles(ctx, path, points) {
  ctx.clearRect(0, 0, state.width, state.height);
  points.forEach(point => {
    const { layout } = point;
    ctx.save();
    ctx.translate(xScale(layout.x), yScale(layout.y));
    ctx.scale(layout.scale, layout.scale);
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const l = segment.length;
      ctx.moveTo(segment[0], segment[1]);
      for (let j = 2; j < l; j += 6) {
        ctx.bezierCurveTo(
          segment[j],
          segment[j + 1],
          segment[j + 2],
          segment[j + 3],
          segment[j + 4],
          segment[j + 5]
        );
      }
      if (segment.closed) {
        ctx.closePath();
      }
    }
    ctx.stroke();
    ctx.restore();
  });
}

function drawBottleWaves(ctx, path, points) {
  ctx.clearRect(0, 0, state.width, state.height);
  points.forEach(point => {
    const { layout } = point;
    ctx.save();
    ctx.fillStyle = point.quality ? gradientGood : gradientBad;
    ctx.translate(xScale(layout.x), yScale(layout.y));
    ctx.scale(layout.scale, layout.scale);

    // Clip path.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(state.width, 0);
    ctx.lineTo(state.width, state.height);
    ctx.lineTo(0, state.height);
    ctx.closePath();
    ctx.clip();

    // Background.
    ctx.fill(path);

    ctx.restore();
  });
}

function renderBottleGrid() {
  requestAnimationFrame(() => {
    gradientGood = getGradient(state.bottleGrid.colour.good);
    gradientBad = getGradient(state.bottleGrid.colour.bad);
    drawBottleWaves(
      state.ctx.bottleWave,
      state.bottleWave.bottlePath,
      state.bottleGrid.dataOrigin
    );
    drawBottles(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.bottleGrid.dataOrigin
    );
  });
}

// Tweening functions.
function defineTweenBottleGrid() {
  // Prep.
  setScales();
  prepData();

  // Tween
  const tl = gsap.timeline({ onUpdate: renderBottleGrid });

  const pointtween = gsap.to(
    state.bottleGrid.dataOrigin.map(d => d.layout),
    {
      x: i => state.bottleGrid.dataTarget[i].layout.x,
      y: i => state.bottleGrid.dataTarget[i].layout.y,
      scale: i => state.bottleGrid.dataTarget[i].layout.scale,
      stagger: 0.01,
    }
  );

  return tl.add(pointtween);
}

function tweenBottleGrid() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleGrid');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleGrid) state.tween.bottleGrid.kill();
  state.tween.bottleGrid = defineTweenBottleGrid();
  state.tween.bottleGrid.totalProgress(progress);
}

export default tweenBottleGrid;
export { drawBottles, drawBottleWaves, renderBottleGrid };
