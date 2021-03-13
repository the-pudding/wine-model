/* eslint-disable no-param-reassign */
import { max } from 'd3-array/src/index';
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';
import { bezWithArrowheads } from '../app/utils';

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
};

const output = {
  p1: { x: 0 },
  p2: { x: 0 },
  y: { y: 0 },
  arrow: { size: 0 },
  yAdd: undefined,
};

// Canvas draw function.
function drawBlackBox(ctx, t) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  // Scaling and translating with some added "pulse" to
  // suck up the predictors and spit out the dependent.
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);

  // Draw box (animate)
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 0.1;
  state.blackBox.box.paths.forEach(path => {
    ctx.setLineDash([
      state.blackBox.box.length - state.blackBox.box.offset,
      state.blackBox.box.offset,
    ]);
    ctx.stroke(path);
  });

  // Draw text (don't animate).
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  state.blackBox.model.paths.forEach(path => {
    ctx.stroke(path);
  });

  ctx.restore();
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
    bezWithArrowheads(
      ctx,
      p0,
      p1,
      p2,
      undefined,
      output.arrow.size,
      false,
      true
    );

    ctx.restore();
  });

  ctx.restore();
}

function renderBlackBox() {
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
function defineTweenBlackBox(type) {
  // Things to tween.
  const tl = gsap.timeline({ onUpdate: renderBlackBox });

  // Arrow data.
  bottleWidth = state.glassBottle.bottleBox.width;
  letterHeight = max(
    state.lolli.data[outputProperties[0]].text.dims,
    d => d.height
  );
  output.yAdd = -state.lolli.y.step() * 0.1;

  if (type === 'arrowIn') {
    // Box path.
    const boxoffset = gsap.fromTo(
      state.blackBox.box,
      { offset: state.blackBox.box.length },
      { offset: 0 }
    );

    // Tween add.
    tl.add(boxoffset);

    // Input arrow tweens.
    const p1tween = gsap.fromTo(
      input.p1,
      { x: 0 },
      { x: -bottleWidth * 0.125 }
    );
    const p2tween = gsap.fromTo(input.p2, { x: 0 }, { x: -bottleWidth * 0.33 });
    const yEndTween = gsap.fromTo(
      input.yEndAdd,
      [0, 0, 0],
      [
        +state.lolli.y.step() * 0.6,
        +state.lolli.y.step() * 0.1,
        -state.lolli.y.step() * 0.33,
      ]
    );
    const arrowtween = gsap.fromTo(input.arrow, { size: 0 }, { size: 5 });

    // Tween add.
    tl.add(p1tween, '>');
    tl.add(p2tween, '<');
    tl.add(yEndTween, '<');
    tl.add(arrowtween, '<');
  }

  if (type === 'arrowOut') {
    // Output arrow tweens.
    const p1outtween = gsap.fromTo(
      output.p1,
      { x: -bottleWidth * 0.33 },
      { x: -bottleWidth * 0.2 }
    );
    const p2outtween = gsap.fromTo(
      output.p2,
      { x: -bottleWidth * 0.33 },
      { x: -5 }
    );
    const ytween = gsap.fromTo(
      output.y,
      { y: -letterHeight * 0.5 + output.yAdd },
      { y: letterHeight * 0.5 }
    );
    const arrowOutTween = gsap.fromTo(output.arrow, { size: 0 }, { size: 5 });

    // Tween add.
    tl.add(p1outtween, '>');
    tl.add(p2outtween, '<');
    tl.add(ytween, '<');
    tl.add(arrowOutTween, '<');

    // Path dash offset.
    const datapoint = state.lolli.data.quality;
    const offsettween = gsap.fromTo(
      datapoint.text,
      { offset: datapoint.text.length },
      { offset: 0 }
    );

    // Tween add.
    tl.add(offsettween, '<');
  }

  return tl;
}

const arrows = ['arrowIn', 'arrowOut'];

function tweenBlackBox() {
  arrows.forEach(d => {
    // Capture current progress.
    const scroll = ScrollTrigger.getById(d);
    const progress = scroll ? scroll.progress : 0;

    // Kill old - set up new timeline.
    if (state.tween[d]) state.tween[d].kill();
    state.tween[d] = defineTweenBlackBox(d);
    state.tween[d].totalProgress(progress);
  });
}

export default tweenBlackBox;
export { arrows, drawBlackBox };
