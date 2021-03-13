/* eslint-disable no-prototype-builtins */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */

// External libs.
import { extent } from 'd3-array/src';
import { forceSimulation } from 'd3-force';
import { scaleLinear } from 'd3-scale/src';
import 'd3-transition';

import { linearRegression, linearRegressionLine } from 'simple-statistics';

// Internal modules.
import gsap from 'gsap/gsap-core';
import state from '../app/state';
import frequency from '../layouts/frequency';
import labels from '../layouts/labels';
import { txScale, tyScale } from './globe';
import {
  prettyLabel,
  getLinearScale,
  euclideanDistance,
  isMobile,
} from '../app/utils';

// Module scope.
const dotRadius = 1.5;
let dot;
let dotGood;
let dotBad;
let margin;
let xScale;
let yScale;
let sim;
const tickPadding = 20;
let yLabelAlign = 'left';

// Regression line data.
let lrLine;
let start = [];
let end = [];
let cp1 = [];
let cp2 = [];
let length;
let offset;

// Point on regression line data.
let pointStart = [];
let point = [];
let pointEnd = [];
let pointRadius;
let pointAlpha;

// Utils
function tweenStatsAlpha(value, dur = 0.5) {
  gsap.to(state.stats.alpha, { value, duration: dur });
}

// Scales and Data
// ---------------
function getScales() {
  yLabelAlign = isMobile() ? 'center' : 'left';
  const horzFactor = isMobile() ? 0.32 : 0.3;
  const vertFactor = isMobile() ? 0.32 : 0.3;
  margin = {
    top: state.height * 0.3,
    right: state.width * vertFactor,
    bottom: state.height * horzFactor,
    left: state.width * 0.3,
  };

  xScale = scaleLinear().range([margin.left, state.width - margin.right]);
  yScale = scaleLinear().range([state.height - margin.bottom, margin.top]);
}

// At each tick, this returns an object with the x and y position
// for each label as well as their text value.
function getLabelCoordinates() {
  if (!state.stats.current.length) return;

  // Get the tick values, the cloud's bounding box and the label positions.
  state.stats.current.forEach(el => {
    const { name, axis, straight } = el;
    const labelLayout = labels()
      .nestKey(d => d.layout[name].value)
      .axis(axis)
      .padding(tickPadding)
      .align(straight)(state.stats.data);

    // Add layout to the current variable object.
    el.labelLayout = labelLayout;
  });
}

// Draw Line functions
function getLinearLine(xRange) {
  // Calculate the line function.
  const lrInput = state.stats.data.map(d => [d.x, d.y]);
  const lr = linearRegression(lrInput);
  lrLine = linearRegressionLine(lr);

  // Calculate the length and offset and save the
  // variables for the draw func in module scope.
  start = [xRange[0], lrLine(xRange[0])];
  cp1 = start.slice();
  end = [xRange[1], lrLine(xRange[1])];
  cp2 = end.slice();
  length = euclideanDistance(start, end);
  offset = (1 - state.stats.progress.draw) * length;
}

function getLinearLineExtension(xRange) {
  const extension = state.stats.progress.extend * (xRange[1] - xRange[0]);
  start = [xRange[0] - extension, lrLine(xRange[0] - extension)];
  cp1 = start.slice();
  end = [xRange[1] + extension, lrLine(xRange[1] + extension)];
  cp2 = end.slice();
  length = euclideanDistance(start, end);
  offset = (1 - state.stats.progress.draw) * length;
}

function getLogisticLine(xRange) {
  // Need this to get the exact y positions.
  const yAxisValues = state.stats.current.filter(d => d.axis === 'y');

  // Run it only if stars align.
  // We might want to probably also condition this on progress.logistic being > 0
  if (!yAxisValues.length || !yAxisValues[0].labelLayout) return;

  // How to debug:
  // if (state.stats.progress.logistic > 0) debugger;

  // Get the exact x and y position is a bit of a song and dance.
  // Basically, we need the tick values from the labels for
  // the axes positions we'll use as logistic start and end curve points.
  const yTicks = yAxisValues[0].labelLayout.ticks;
  const yValues = [yTicks[0].value.y, yTicks[1].value.y];
  const startDest = [
    state.stats.current[0].labelLayout.bbox.xMin - 10,
    yValues[0],
  ];
  const endDest = [
    state.stats.current[0].labelLayout.bbox.xMax + 10,
    yValues[1],
  ];

  // The control points are fractions of the xRange distance.
  const cp1xDest = xRange[0] + (xRange[1] - xRange[0]) * 0.8;
  const cp2xDest = xRange[0] + (xRange[1] - xRange[0]) * 0.5;

  // Interpolating (could use gsap here, but that would require state and stuff..)
  start[0] += state.stats.progress.logistic * (startDest[0] - start[0]);
  start[1] += state.stats.progress.logistic * (startDest[1] - start[1]);
  end[0] += state.stats.progress.logistic * (endDest[0] - end[0]);
  end[1] += state.stats.progress.logistic * (endDest[1] - end[1]);
  cp1[1] = start[1];
  cp2[1] = end[1];
  cp1[0] += state.stats.progress.logistic * (cp1xDest - cp1[0]);
  cp2[0] += state.stats.progress.logistic * (cp2xDest - cp2[0]);
}

// Calculates the regression lines.
function getLineDrawingParams() {
  // Only do all this work, when we want to show the regression line.
  if (!state.stats.lr) return;

  // The points x ranges (not the layout, the actual simulated points in px)
  // help calculate the x, y positions of the linear regression line.
  const xRange = extent(state.stats.data, d => d.x);
  xRange[1] += 5; // let it nudge over a little.

  // Calculate the line positions.
  getLinearLine(xRange);
  getLinearLineExtension(xRange);
  getLogisticLine(xRange);
}

// Helper func to find the y tick corresponding to the point's x tick.
function gatherTickInfo(xTick, array) {
  const yValue = lrLine(xTick.value.x);

  // Get the closest y tick.
  const yTick = array.reduce((a, b) =>
    Math.abs(b.value.y - yValue) < Math.abs(a.value.y - yValue) ? b : a
  );

  // A higher x value means we are below the ticl.
  const delta = yValue > yTick.value.y ? 'below' : 'above';

  // Store the data in state so we can fetch it later from the article.
  state.stats.pointTickInfo = { x: xTick.key, y: yTick.key, yDelta: delta };
}

// Set the point coordinates we draw in `drawPoint`.
function getPointDrawingParams() {
  if (!state.stats.lr) return;
  const xAxisValues = state.stats.current.filter(d => d.axis === 'x')[0];
  if (!xAxisValues.labelLayout) return; // double safety net due to random race condition issue.
  const bbox = xAxisValues.labelLayout.bbox;
  const tickNumber = xAxisValues.labelLayout.ticks.length;
  // This needs to go in state / be picked up by the story
  const xTick = xAxisValues.labelLayout.ticks[Math.ceil(tickNumber / 2)];

  // The points' final destination.
  pointStart = [xTick.value.x, bbox.yMax];
  const pointFinal = [pointStart[0], lrLine(pointStart[0])];
  const pointEndFinal = [bbox.xMax, lrLine(pointStart[0])];

  // The initial point positions.
  point = pointStart.slice();
  pointEnd = point.slice();

  // Interpolating from the initial to the final positions.
  point[0] += state.stats.progress.point * (pointFinal[0] - point[0]);
  point[1] += state.stats.progress.point * (pointFinal[1] - point[1]);

  pointEnd[0] += state.stats.progress.point * (pointEndFinal[0] - pointEnd[0]);
  pointEnd[1] += state.stats.progress.point * (pointEndFinal[1] - pointEnd[1]);

  pointRadius = state.stats.progress.point * 5;
  pointAlpha = 1 - state.stats.progress.extend;

  // Get the tick info (what is the x and what the y key?) for the articla.
  // We only need this once to begin with (this func runs repeatedly on render).
  if (!state.stats.pointTickInfo) {
    gatherTickInfo(
      xTick,
      state.stats.current.filter(d => d.axis === 'y')[0].labelLayout.ticks
    );
  }
}

// Layouts
// -------

// Layouts to save in each data row. The simulations
// can move the dots to these with forceX, forceY.
function addLayouts() {
  // Get all variable based layouts.
  const frequencyLayouts = [
    {
      name: 'alcohol',
      layout: frequency().variable('alcohol')(state.stats.data),
    },
    {
      name: 'density',
      layout: frequency().variable('density')(state.stats.data),
    },
    {
      name: 'fixed_acidity',
      layout: frequency().variable('fixed_acidity')(state.stats.data),
    },
    {
      name: 'ph',
      layout: frequency().variable('ph')(state.stats.data),
    },
    {
      name: 'volatile_acidity',
      layout: frequency().variable('volatile_acidity')(state.stats.data),
    },
    {
      name: 'quality',
      layout: frequency().variable('quality')(state.stats.data),
    },
    {
      name: 'quality_binary',
      layout: frequency().variable('quality_binary')(state.stats.data),
    },
  ];

  // Prep the scatter layout loop, with the predictors to use...
  const scatterLayouts = [
    { name: 'alcohol__quality', pred: 'alcohol', out: 'quality' },
    { name: 'alcohol__quality_binary', pred: 'alcohol', out: 'quality_binary' },
    { name: 'vol_acid__quality', pred: 'volatile_acidity', out: 'quality' },
  ];

  // Add all layouts to the main data.
  state.stats.data.forEach(d => {
    d.layout = {};

    // That point where the globe disappears to.
    d.layout.globeExit = {
      x: txScale(1) + Math.random(), // 1
      y: tyScale(1) + Math.random(),
    };

    // Note, the Lattice layout is controlled by the link dataset.

    // Add all variable layouts to the data.
    frequencyLayouts.forEach(el => {
      d.layout[el.name] = {
        x: xScale(el.layout.get(d.id).x),
        y: yScale(el.layout.get(d.id).y),
        value: el.layout.get(d.id).value,
      };
    });

    // Add scatter plot layouts
    scatterLayouts.forEach(el => {
      const predictorScale = getLinearScale(el.pred);
      const outcomeScale = getLinearScale(el.out);
      d.layout[el.name] = {
        x: xScale(predictorScale(d[el.pred])),
        y: yScale(outcomeScale(d[el.out])),
      };
    });
  });
}

// Set an initial layout.
function setLayout(name) {
  state.stats.data.forEach(d => {
    d.x = d.layout[name].x;
    d.y = d.layout[name].y;
  });
}

// Render and draw
// ---------------
function drawDot(r, colour) {
  const can = document.createElement('canvas');
  can.width = can.height = r * 2;
  const ctx = can.getContext('2d');

  ctx.beginPath();
  ctx.fillStyle = colour;
  ctx.arc(r, r, r, 0, 2 * Math.PI);
  ctx.fill();

  return can;
}

function drawPoint(ctx) {
  ctx.save();

  ctx.globalAlpha = pointAlpha;

  // Vertical line.
  ctx.beginPath();
  ctx.moveTo(pointStart[0], pointStart[1]);
  ctx.lineTo(point[0], point[1]);
  ctx.stroke();

  // Point.
  ctx.beginPath();
  ctx.arc(point[0], point[1], pointRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Horizontal line.
  ctx.beginPath();
  ctx.moveTo(point[0], point[1]);
  ctx.lineTo(pointEnd[0], pointEnd[1]);
  ctx.stroke();

  ctx.restore();
}

function drawLine(ctx) {
  // Check for the regression line flag and if there's data to draw.
  if (!state.stats.lr && start.length) return;
  ctx.save();

  ctx.globalAlpha = state.stats.alpha.value;

  // Draw the regression line dynamically.
  ctx.beginPath();
  ctx.setLineDash([length - offset, offset]);
  ctx.moveTo(start[0], start[1]);
  ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

function drawStats(ctx) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();

  ctx.globalAlpha = state.stats.alpha.value;

  // Draw axes and labels.
  if (state.stats.current.length) {
    // Base styles.
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.2;
    const tickFontConfig = '12px Signika';

    // Loop through each of the variables we want to show.
    for (let i = 0; i < state.stats.current.length; i++) {
      const currentVar = state.stats.current[i];
      // Check if there's data to draw with.
      if (!currentVar.hasOwnProperty('labelLayout')) break;
      // Reference element and layout info.
      const labelLayout = currentVar.labelLayout;

      // Draw each tick.
      ctx.fillStyle = '#555555';
      // eslint-disable-next-line no-loop-func
      labelLayout.ticks.forEach((tick, j) => {
        // Base info.
        const x = tick.value.x;
        const y = tick.value.y;
        const label = tick.key;

        // For scatter plots (they have label == true)...
        if (currentVar.label) {
          if (currentVar.axis === 'x') {
            // Get the labels' y value.
            const xTickLine = x;
            const y1TickLine = labelLayout.bbox.yMin;
            let y2TickLine = y - 10;

            // Check for overlapping labels.
            const zigzagCondition = tick.value.zigzag && j % 2 === 0;
            if (zigzagCondition) y2TickLine += 15;

            // Draw the tick line.
            ctx.beginPath();
            ctx.moveTo(xTickLine, y1TickLine);
            ctx.lineTo(xTickLine, y2TickLine);
            ctx.stroke();

            // Draw the labels.
            ctx.font = tickFontConfig;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, x, y2TickLine);
          }
          if (currentVar.axis === 'y') {
            ctx.font = tickFontConfig;
            ctx.textAlign = yLabelAlign;
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y);

            const x1TickLine = labelLayout.bbox.xMin;
            const x2TickLine = x - 10;
            const yTickLine = y;

            ctx.beginPath();
            ctx.moveTo(x1TickLine, yTickLine);
            ctx.lineTo(x2TickLine, yTickLine);
            ctx.stroke();
          }
        }

        // For frequency plots (they have label == false)...
        if (!currentVar.label) {
          // Set the lengths of ticks.
          const y1 = y - tickPadding * 0.5;
          let y2 = y - tickPadding * 0.1;

          // Overwrite y2 if we should arrange long labels in zig zag.
          const zigzagCondition =
            currentVar.axis === 'x' && tick.value.zigzag && j % 2 === 0;
          if (zigzagCondition) y2 += 15;

          // Draw label.
          ctx.font = tickFontConfig;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(label, x, y2 + 5);

          // Draw ticks.
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
        }
      });

      // Draw the header.
      ctx.fillStyle = '#000000';
      if (currentVar.header) {
        const xHeader = labelLayout.label.header.x;
        const yHeader = labelLayout.label.header.y;
        const labelHeader =
          currentVar.name === 'ph' // edge case.
            ? 'pH'
            : prettyLabel(currentVar.name).replace('_', ' ');

        ctx.font = '50px Amatic SC';
        ctx.fillText(labelHeader, xHeader, yHeader - 50);
      }

      // Draw the axis labels.
      if (currentVar.label) {
        const xAxisLabel = labelLayout.label.axisLabel.x;
        const yAxisLabel = labelLayout.label.axisLabel.y;
        const labelAxis = prettyLabel(currentVar.name).replace('_', ' ');

        ctx.font = '20px Amatic SC';
        ctx.fillText(labelAxis, xAxisLabel, yAxisLabel);
      }
    }
  }

  // Draw dots.
  state.stats.data.forEach(d => {
    if (!state.stats.colourDots) {
      ctx.drawImage(dot, d.x, d.y);
    } else {
      ctx.drawImage(d.quality_binary ? dotGood : dotBad, d.x, d.y);
    }
  });

  ctx.restore();
}

function renderStats() {
  getLineDrawingParams();
  getPointDrawingParams();
  requestAnimationFrame(() => {
    drawStats(state.ctx.chart);
    drawLine(state.ctx.chart);
    drawPoint(state.ctx.chart);
  });
}

// Simulations
// -----------

// All the stuff we run per tick.
function handleTick() {
  getLabelCoordinates();
  renderStats();
}

// Forces applied to all simulations.
function boundingBox() {
  // Relies on some globals.
  const r = dotRadius;
  state.stats.data.forEach(node => {
    node.x = Math.max(r, Math.min(node.x, state.width - r * 2));
    node.y = Math.max(r, Math.min(node.y, state.height - r * 2));
  });
}

// Set up the simulations and stop it. We don't want
// to start it until ScrollTrigger triggers it.
function setSimulation() {
  sim = forceSimulation(state.stats.data)
    .force('boxForce', boundingBox)
    .on('tick', handleTick)
    .stop();
}

// Initial function run on each update.
function tweenStats() {
  getScales();
  addLayouts();
  setLayout('globeExit');
  setSimulation();
  dot = drawDot(dotRadius, state.bottleColour.base.stop1);
  dotGood = drawDot(dotRadius, state.bottleColour.good.dot);
  dotBad = drawDot(dotRadius, state.bottleColour.bad.dot);
}

export default tweenStats;
export { sim, renderStats, boundingBox, tweenStatsAlpha };

// 1. Math.random to disperse them a little to start with.
