/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { feature } from 'topojson-client';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';

import { scaleLinear } from 'd3-scale';
import state from '../app/state';
import { bezWithArrowheads } from '../app/utils';

let countries;
let portugal;
let projection;
let path;
let pathSvg;
let sphere;
let grid;
let txScale;
let tyScale;
let sScale;
let rScale;
let gaScale;
let aaScale;
let point0;
let point1;
let point2;

// Globe gradient colours.
const colours = [
  { colour: '#f4eee7', stop: 0.1 },
  { colour: '#e1dcd6', stop: 0.3 },
  { colour: '#cfcac5', stop: 0.4 },
  { colour: '#bcb9b4', stop: 0.5 },
  { colour: '#aaa7a4', stop: 0.6 },
  { colour: '#999794', stop: 0.7 },
  { colour: '#878684', stop: 0.8 },
  { colour: '#767675', stop: 0.9 },
  { colour: '#666666', stop: 1 },
];

// The center of the world (Northern Portugal in our case).
const rBase = [8, -42, 0];

// Values for the gradient. // 1
const gradientCentrePoint = [-30, 40];
const gradientEdgePoint = [-60, 40];
let gradientValues;

/**
 * Calculates the distance between two [lon, lat] points
 * in pixel, given a projection.
 * @param { 2d array } pStart The start point for the distance calc
 * @param { 2d array } pEnd The end point for the distance calc
 * @param { function } proj The projection
 * @returns { object } Star, end point as well as distance in pixel.
 */
function getPixelDistance(pStart, pEnd, proj) {
  const pStartPx = proj(pStart);
  const pEndPx = proj(pEnd);
  const distVector = [pEndPx[0] - pStartPx[0], pEndPx[1] - pStartPx[1]];
  const distance = Math.sqrt(
    Math.pow(distVector[0], 2) + Math.pow(distVector[1], 2)
  );
  return { start: pStartPx, end: pEndPx, distance };
}

function drawGlobe(ctx) {
  const rough = state.rough.globe;
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();

  ctx.globalAlpha = gaScale(state.globe.scroll.progress);

  // Set the globe's radial gradient.
  const grad = ctx.createRadialGradient(
    0,
    0,
    gradientValues.distance,
    0,
    0,
    gradientValues.distance * 6
  );

  // Add colour steps.
  colours.forEach(d => grad.addColorStop(d.stop, d.colour));

  ctx.fillStyle = grad;
  ctx.beginPath(), path(sphere), ctx.fill();

  ctx.lineWidth = 0.05;
  ctx.strokeStyle = '#000000';
  ctx.beginPath(), path(grid), ctx.stroke();

  ctx.lineWidth = 0.5;
  ctx.beginPath(), path(countries), ctx.stroke();

  ctx.fillStyle = '#ff00ff';
  rough.path(pathSvg(portugal), {
    fill: state.bottleColour.bad.stop1,
    stroke: state.bottleColour.bad.stop1,
  });

  // Label and arrow.
  ctx.globalAlpha = aaScale(state.globe.scroll.progress);
  ctx.fillStyle = state.bottleColour.bad.stop0;
  ctx.font = 'bold 30px Amatic SC';
  ctx.textAlign = 'end';
  ctx.textBaseline = 'top';
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 4;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.fillText('Portugal', point2.x, point2.y + 10);

  ctx.lineWidth = 5;
  ctx.strokeStyle = state.bottleColour.bad.stop0;
  bezWithArrowheads(ctx, point0, point1, point2, undefined, 15, false, true);

  ctx.restore();
}

function renderGlobe() {
  // Set the projection tranform.
  projection.translate([
    txScale(state.globe.scroll.progress),
    tyScale(state.globe.scroll.progress),
  ]);
  projection.scale(sScale(state.globe.scroll.progress));
  const r = rScale(state.globe.scroll.progress);
  projection.rotate([rBase[0] + r, rBase[1] + r, rBase[2]]);

  // Radial gradient parameters.
  gradientValues = getPixelDistance(
    gradientCentrePoint,
    gradientEdgePoint,
    projection
  );

  // Arrow control point.
  point1 = projection([-20, 43]);
  point1 = { x: point1[0], y: point1[1] };

  // Arrow end point.
  point2 = projection([-10, 41]);
  point2 = { x: point2[0], y: point2[1] };

  // Start the render.
  requestAnimationFrame(() => drawGlobe(state.ctx.globe));
}

function prepData() {
  // Convert from topo to geoJSON.
  countries = feature(
    state.globe.data,
    state.globe.data.objects.ne_110m_admin_0_countries
  );

  [portugal] = countries.features.filter(
    d => d.properties.admin === 'Portugal'
  );

  // Arrow control point 0.
  point0 = { x: state.width * 0.35, y: state.height * 0.45 };
}

function prepGeoTools() {
  projection = geoOrthographic().fitSize(
    [state.width, state.height],
    countries
  );

  path = geoPath().projection(projection).context(state.ctx.globe);

  pathSvg = geoPath().projection(projection);

  sphere = { type: 'Sphere' };
  grid = geoGraticule()();
}

function prepScales() {
  // Translate scales.
  txScale = scaleLinear()
    .domain([0, 0.5])
    .range([state.width * 0.3, state.width * 0.5]);

  tyScale = scaleLinear()
    .domain([0, 0.3, 0.7, 1])
    .range([
      state.height * 0.2,
      state.height * 0.5,
      state.height * 0.475,
      state.height * 0.2,
    ]);

  // The scale scale.
  const sInit = projection.scale();
  sScale = scaleLinear()
    .domain([0, 0.3, 0.7, 1])
    .range([sInit, sInit * 2, sInit * 2, 0]);

  // The globe rotation scale.
  rScale = scaleLinear().domain([0, 0.3, 0.7, 1]).range([-50, -1, 1, 100]);

  // The globe's globalAlpha scale.
  gaScale = scaleLinear().domain([0, 0.1, 0.9, 1]).range([0, 1, 1, 0]);

  // The arrow's globalAlpha scale.
  aaScale = scaleLinear()
    .domain([0, 0.3, 0.35, 0.65, 0.7, 1])
    .range([0, 0, 1, 1, 0, 0]);
}

function defineTweenGlobe() {
  prepData();
  prepGeoTools();
  prepScales();

  const tl = gsap.timeline({ onUpdate: renderGlobe });
  // Bonkers tween to make timeline work. We could work straight
  // off ScrollTrigger, but this is more in tune with the rest.
  const blub = gsap.to({ bar: 0 }, { bar: 1 });
  return tl.add(blub);
}

function tweenGlobe() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('globe');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.globe) state.tween.globe.kill();
  state.tween.globe = defineTweenGlobe();
  state.tween.globe.totalProgress(progress);
}

export default tweenGlobe;
export { txScale, tyScale };

// 1. So I worked a whole evening on finding a radial gradient circle
//    whose centre remains on the transformed earth, which culminated in the
//    `getPixelDistance` function. Only to find by accident that setting
//    a radial gradient simply at (0, 0) looks in fact better. The distance
//    is still being used though - although this could be solved with a
//    simple linear scale synced with the scale-scale.
