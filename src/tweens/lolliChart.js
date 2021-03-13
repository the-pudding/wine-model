/* eslint-disable no-multi-assign */
/* eslint-disable prefer-destructuring */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { scaleLinear, scalePoint } from 'd3-scale/src/index';
import state from '../app/state';

state.lolli.area = {
  top: undefined,
  right: undefined,
  bottom: undefined,
  left: undefined,
  height: undefined,
  width: undefined,
};

// Utils.
function setDimensions() {
  // Set the lolli area.
  const bottle = state.glassBottle; // Just for shortness.
  // Horizontal dims.
  state.lolli.area.left = Math.floor(bottle.bottleBox.width * 1.05);
  state.lolli.area.width = Math.floor(
    (state.width / state.transform.bottle.scale) * bottle.bottleLeft +
      bottle.bottleBox.width
  );
  state.lolli.area.right = Math.floor(
    state.lolli.area.left + state.lolli.area.width
  );
  // Vertical dims.
  state.lolli.area.top = Math.floor(bottle.bottleBox.height * 0.5);
  state.lolli.area.bottom = Math.floor(bottle.bottleBox.height * 0.9);
  state.lolli.area.height = Math.floor(
    state.lolli.area.bottom - state.lolli.area.top
  );

  // Set the lolli radius' target value.
  state.lolli.radiusTarget = 5 / state.transform.bottle.scale;

  // Set the lolly scales.
  state.lolli.x = scaleLinear(
    [0, 1],
    [state.lolli.area.left, state.lolli.area.right]
  );
  state.lolli.y = scalePoint()
    .domain(state.lolli.keys)
    .range([state.lolli.area.top, state.lolli.area.bottom]);
}

const colScale = scaleLinear().range(['#CE6A8C', '#1773C9']);

// Canvas draw function.
function drawLolliChart(ctx, t) {
  const rough = state.rough.chart;
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);

  state.lolli.keys.forEach((d, i) => {
    const datapoint = state.lolli.data[d];

    const xValue = datapoint.value;
    const { length } = datapoint.text;
    const { offset } = datapoint.text;
    const { paths } = datapoint.text;

    ctx.save();
    if (d === 'quality') {
      ctx.strokeStyle = ctx.fillStyle = colScale(xValue);
    } else {
      ctx.strokeStyle = ctx.fillStyle = 'black';
    }
    // Line.
    ctx.beginPath();
    rough.line(
      state.lolli.x(0),
      state.lolli.y(d),
      state.lolli.x(xValue),
      state.lolli.y(d),
      { seed: i + 1, roughness: 0.5 }
    );
    ctx.stroke();

    // Circle.
    ctx.beginPath();
    ctx.arc(
      state.lolli.x(xValue),
      state.lolli.y(d),
      datapoint.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Text.
    // ctx.strokeStyle = ctx.fillStyle = 'black';
    ctx.translate(state.lolli.x(0), state.lolli.y(d) + 2);
    ctx.lineWidth = 0.5;
    ctx.setLineDash([length - offset, offset]);
    paths.forEach(path => ctx.stroke(path));
    ctx.restore();
  });

  ctx.restore();
}

function renderLolliChart() {
  requestAnimationFrame(() =>
    drawLolliChart(state.ctx.chart, state.transform.bottle)
  );
}

// As tweenLolliUpdate and blackbox are set later, it seems to change
// all initial values (.values[0]) as set by this tweenLolliChart. 🤷‍♂️
function forceInitialValues() {
  Object.keys(state.lolli.data).forEach(d => {
    const datapoint = state.lolli.data[d];
    datapoint.value = datapoint.values[0];
    datapoint.radius = 0;
    datapoint.text.offset = datapoint.text.length;
  });
}

function defineTweenLolliChart() {
  setDimensions();

  // Things to tween.
  const tl = gsap.timeline({
    onStart: forceInitialValues,
    onUpdate: renderLolliChart,
  });

  // Loop through all lolli-data (which is an object).
  Object.keys(state.lolli.data).forEach(d => {
    // Datapoint to tween around with.
    const datapoint = state.lolli.data[d];

    // Set up the tweens.
    const valueTween = gsap.fromTo(
      datapoint,
      { value: datapoint.values[0] },
      { value: datapoint.values[1] }
    );
    const radiusTween = gsap.fromTo(
      datapoint,
      { radius: 0 },
      { radius: state.lolli.radiusTarget }
    );
    const offsetTween = gsap.fromTo(
      datapoint.text,
      { offset: datapoint.text.length },
      { offset: 0 }
    );

    // Add the tweens to the timeline.
    // "<" start or ">" end of previous tween.
    tl.add(valueTween, '>').add(radiusTween, '<').add(offsetTween, '>');
  });

  return tl;
}

function tweenLolliChart() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('lolliChart');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.lolliChart) state.tween.lolliChart.kill();
  state.tween.lolliChart = defineTweenLolliChart();
  state.tween.lolliChart.totalProgress(progress);
}

export default tweenLolliChart;
export { renderLolliChart };
