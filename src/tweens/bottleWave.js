/* eslint-disable no-use-before-define */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { range } from 'd3-array/src/index';
import { scalePoint } from 'd3-scale/src/index';
import { line, curveBasis } from 'd3-shape/src/index';

import state from '../app/state';
import { getGradient } from '../app/utils';

let gradient;

// Utils.

/**
 * Calculate wave point coordinates.
 * @param { Number } r the base circle radius
 * @param { Number } alpha circle rotation delay
 * @param { Number } beta circle rotation speed
 * @param { Number } x0 initial x position
 * @param { Number } y0 initial y position
 * @param { Number } t time
 * @return { Array } wave point coordinates
 */
function getWavePoints(r, alpha, beta, x0, y0, t) {
  const arg = alpha * x0 + beta * t;
  const x = x0 + r * Math.cos(arg);
  const y = y0 + r * Math.sin(arg);
  return [x, y];
}

/**
 * Makes the wave points and draws the wine.
 * @param { Number } time time ideally at each tick.
 * @returns { Array } 2d array of x, y coordinates.
 */
function makeWave(time) {
  // 1) We get an array of n wave points and save it in state
  // for the draw function to feed from.
  state.bottleWave.wavePoints = range(state.bottleWave.n).map((d, i) => {
    // For each point (indexed from 0 to n), we add
    // a few parameters. x0 and y0 decide the position.
    const x0 = state.bottleWave.xWaveScale(d);
    const y0 = (1 - state.bottleWave.lift) * state.glassBottle.bottleBox.height;

    // The main point generation function, which sets x and y
    // based on the time passed in.
    const xy = getWavePoints(
      state.bottleWave.r,
      state.bottleWave.waveAlpha,
      1.5,
      x0,
      y0,
      time * 5
    );

    // The first and the last point are pinned to the sides.
    if (i === 0) xy[0] = state.glassBottle.bottleBox.x;
    if (i === state.bottleWave.n - 1) xy[0] = state.glassBottle.bottleBox.width;
    return xy;
  });

  // 2) Kick off the rendering at each tick.
  renderBottleWave();
}

/**
 * Kicks of the wine wave draw on each tick.
 * Passes in the time at each tick implicitly.
 */
function startWave() {
  // Throttle the ticker if necessary.
  // gsap.ticker.fps(30);
  gsap.ticker.add(makeWave);
}

function stopWave() {
  gsap.ticker.remove(makeWave);
}

/**
 * Little additional tween every time the user scrolls
 * to kickstart and slowly decay the wave.
 */
function decayWave() {
  gsap
    .timeline()
    .to(state.bottleWave, { r: 10, duration: 0.2 })
    .to(state.bottleWave, { r: 1, duration: 2 });
}

// Tween and draw.
function drawBottleWave(ctx, path, t) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);

  // Clip path.
  ctx.beginPath();

  state.bottleWave.waveLine.context(ctx)(state.bottleWave.wavePoints);
  ctx.lineTo(state.width, state.height);
  ctx.lineTo(0, state.height);
  ctx.closePath();
  ctx.clip();

  // Background.
  ctx.fill(path);

  ctx.restore();
}

function renderBottleWave() {
  requestAnimationFrame(() => {
    state.ctx.bottleWave.save();
    state.ctx.bottleWave.fillStyle = gradient;

    drawBottleWave(
      state.ctx.bottleWave,
      state.bottleWave.bottlePath,
      state.transform.shape
    );

    state.ctx.bottleWave.restore();
  });
}

function defineTweenBottleWave(liftStart, liftTarget) {
  // The wave's x scale and line generator.
  state.bottleWave.xWaveScale = scalePoint()
    .domain(range(state.bottleWave.n))
    .range([0, state.width]);

  state.bottleWave.waveLine = line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(curveBasis);

  state.bottleWave.waveAlpha = state.width / state.height < 0.5 ? 1 : 5;

  // The bottle's fill.
  gradient = getGradient(state.bottleColour.base);

  // Set up timeline.
  // On scroll the lift gets updated, which startWave's
  // canvas draw function picks up to lift the waving wave.
  // Note the lift's start and target are arguments as this tween is being
  // built in two situations.
  const tl = gsap.timeline({ onStart: startWave, onUpdate: decayWave });

  const lift = gsap.fromTo(
    state.bottleWave,
    { lift: liftStart },
    { lift: liftTarget }
  );

  return tl.add(lift);
}

function tweenBottleWave() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleWave');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleWave) state.tween.bottleWave.kill();
  state.tween.bottleWave = defineTweenBottleWave(-0.1, 0.6);
  state.tween.bottleWave.totalProgress(progress);
}

export default tweenBottleWave;
export {
  defineTweenBottleWave,
  drawBottleWave,
  startWave,
  stopWave,
  decayWave,
};
