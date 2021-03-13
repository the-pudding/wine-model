/* eslint-disable no-param-reassign */
import { max } from 'd3-array/src/index';
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';
import { drawBlackBox } from './blackBox';

// Vars (helper and tweenables).
const inputProperties = ['alcohol', 'acids', 'sugars'];
const outputProperties = ['quality'];

let letterHeight;
let bottleWidth;

const input = {
  p1: { x: 0 },
  p2: { x: 0 },
  yEndAdd: [0, 0, 0],
  arrow: { size: 0 },
  paths: {
    length: 0,
    offset: 0,
  },
};

const output = {
  p1: { x: 0 },
  p2: { x: 0 },
  y: { y: 0 },
  arrow: { size: 0 },
  yAdd: undefined,
};

// Utils.
function bezWithArrowheads(
  ctx,
  p0,
  p1,
  p2,
  p3,
  arrowLength,
  hasStartArrow,
  hasEndArrow
) {
  let x;
  let y;
  let norm;
  let ex;
  let ey;
  function pointsToNormalisedVec(p, pp) {
    norm.y = pp.x - p.x;
    norm.x = -(pp.y - p.y);
    const len = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
    norm.x /= len;
    norm.y /= len;
    return norm;
  }

  const arrowWidth = arrowLength / 2;
  norm = {};
  // defaults to true for both arrows if arguments not included
  hasStartArrow =
    hasStartArrow === undefined || hasStartArrow === null
      ? true
      : hasStartArrow;
  hasEndArrow =
    hasEndArrow === undefined || hasEndArrow === null ? true : hasEndArrow;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  if (p3 === undefined) {
    ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
    ex = p2.x; // get end point
    ey = p2.y;
    norm = pointsToNormalisedVec(p1, p2);
  } else {
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ex = p3.x; // get end point
    ey = p3.y;
    norm = pointsToNormalisedVec(p2, p3);
  }
  if (hasEndArrow) {
    x = arrowWidth * norm.x + arrowLength * -norm.y;
    y = arrowWidth * norm.y + arrowLength * norm.x;
    ctx.moveTo(ex + x, ey + y);
    ctx.lineTo(ex, ey);
    x = arrowWidth * -norm.x + arrowLength * -norm.y;
    y = arrowWidth * -norm.y + arrowLength * norm.x;
    ctx.lineTo(ex + x, ey + y);
  }
  if (hasStartArrow) {
    norm = pointsToNormalisedVec(p0, p1);
    x = arrowWidth * norm.x - arrowLength * -norm.y;
    y = arrowWidth * norm.y - arrowLength * norm.x;
    ctx.moveTo(p0.x + x, p0.y + y);
    ctx.lineTo(p0.x, p0.y);
    x = arrowWidth * -norm.x - arrowLength * -norm.y;
    y = arrowWidth * -norm.y - arrowLength * norm.x;
    ctx.lineTo(p0.x + x, p0.y + y);
  }

  ctx.stroke();
}

function drawProperties(ctx, t, inputVars, outputVars) {
  ctx.clearRect(0, 0, state.width, state.height);

  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);

  // Draw input properties.
  inputVars.forEach((d, i) => {
    const { paths } = state.lolli.data[d].text;

    ctx.save();
    ctx.translate(state.lolli.x(0), state.lolli.y(d) + 2);

    // Draw text
    ctx.lineWidth = 0.5;
    ctx.setLineDash([
      input.paths.length - input.paths.offset,
      input.paths.offset,
    ]);
    paths.forEach(path => ctx.stroke(path));

    // Draw line
    ctx.lineWidth = 1.25;
    const p0 = { x: 0, y: letterHeight * 0.5 };
    const p1 = { x: input.p1.x, y: letterHeight * 0.5 };
    const p2 = { x: input.p2.x, y: letterHeight * 0.5 + input.yEndAdd[i] };

    ctx.strokeStyle = 'white';
    bezWithArrowheads(
      ctx,
      p0,
      p1,
      p2,
      undefined,
      input.arrow.size,
      false,
      true
    );

    ctx.restore();
  });

  // Draw output property (or properties).
  outputVars.forEach(d => {
    const { length } = state.lolli.data[d].text;
    const { offset } = state.lolli.data[d].text;
    const { paths } = state.lolli.data[d].text;

    ctx.save();
    ctx.translate(state.lolli.x(0), state.lolli.y(d) + 2);

    // Draw text
    ctx.lineWidth = 0.5;
    ctx.setLineDash([length - offset, offset]);
    paths.forEach(path => ctx.stroke(path));

    // Draw line
    ctx.lineWidth = 1.25;
    const p0 = { x: -bottleWidth * 0.33, y: -letterHeight * 0.5 + output.yAdd };
    const p1 = { x: output.p1.x, y: output.y.y };
    const p2 = { x: output.p2.x, y: output.y.y };

    ctx.strokeStyle = 'white';
    bezWithArrowheads(ctx, p0, p1, p2, undefined, 5, false, true);

    ctx.restore();
  });

  ctx.restore();
}

function renderCleanup() {
  requestAnimationFrame(() => {
    drawBlackBox(state.ctx.blackBox, state.transform.bottle);
    drawProperties(
      state.ctx.chart,
      state.transform.bottle,
      inputProperties,
      outputProperties
    );
  });
}

// Tween function.
function defineTweenCleanup() {
  // Things to tween.
  const tl = gsap.timeline({ onUpdate: renderCleanup });

  // Arrow tweens.
  bottleWidth = state.glassBottle.bottleBox.width;
  letterHeight = max(
    state.lolli.data[outputProperties[0]].text.dims,
    d => d.height
  );
  output.yAdd = -state.lolli.y.step() * 0.1;

  // Input arrow tweens.
  const p1tween = gsap.fromTo(input.p1, { x: -bottleWidth * 0.125 }, { x: 0 });
  const p2tween = gsap.fromTo(input.p2, { x: -bottleWidth * 0.33 }, { x: 0 });
  const yEndTween = gsap.fromTo(
    input.yEndAdd,
    [
      +state.lolli.y.step() * 0.6,
      +state.lolli.y.step() * 0.1,
      -state.lolli.y.step() * 0.33,
    ],
    [0, 0, 0]
  );
  const arrowtween = gsap.fromTo(input.arrow, { size: 5 }, { size: 0 });

  // Path dash offset.
  input.paths.length = max(
    inputProperties.map(d => state.lolli.data[d].text.length)
  );

  const offsettween1 = gsap.fromTo(
    input.paths,
    { offset: 0 },
    { offset: input.paths.length }
  );

  tl.add(offsettween1, '<');

  // Tween add.
  tl.add(p1tween, '<');
  tl.add(p2tween, '<');
  tl.add(yEndTween, '<');
  tl.add(arrowtween, '<');

  // Output arrow tweens.
  const p1outtween = gsap.fromTo(
    output.p1,
    { x: -bottleWidth * 0.2 },
    { x: -bottleWidth * 0.33 }
  );
  const p2outtween = gsap.fromTo(
    output.p2,
    { x: -5 },
    { x: -bottleWidth * 0.33 }
  );
  const ytween = gsap.fromTo(
    output.y,
    { y: letterHeight * 0.5 },
    { y: -letterHeight * 0.5 + output.yAdd }
  );
  const arrowOutTween = gsap.fromTo(output.arrow, { size: 5 }, { size: 0 });

  // Tween add.
  tl.add(p1outtween, '<');
  tl.add(p2outtween, '<');
  tl.add(ytween, '<');
  tl.add(arrowOutTween, '<');

  // Path dash offset.
  const datapoint = state.lolli.data.quality;
  const offsettween = gsap.fromTo(
    datapoint.text,
    { offset: 0 },
    { offset: datapoint.text.length }
  );

  // Tween add.
  tl.add(offsettween, '<');

  // Box path.
  const boxoffset = gsap.fromTo(
    state.blackBox.box,
    { offset: 0 },
    { offset: state.blackBox.box.length }
  );

  // Tween add.
  tl.add(boxoffset, '<');

  return tl;
}

function tweenCleanup() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('cleanup');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.cleanup) state.tween.cleanup.kill();
  state.tween.cleanup = defineTweenCleanup();
  state.tween.cleanup.totalProgress(progress);
}

export default tweenCleanup;
