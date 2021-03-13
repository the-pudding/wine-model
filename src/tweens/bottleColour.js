/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { getGradient } from '../app/utils';

import state from '../app/state';
import { drawBottleWave } from './bottleWave';
import { drawBottle } from './glassBottle';

// Describe the colour stop journey.
const colours = state.bottleColour;
const bottleColours = [
  {
    name: 'colourGood',
    fromStop0: colours.base.stop0,
    toStop0: colours.good.stop0,
    fromStop1: colours.base.stop1,
    toStop1: colours.good.stop1,
  },
  {
    name: 'colourBad',
    fromStop0: colours.good.stop0,
    toStop0: colours.bad.stop0,
    fromStop1: colours.good.stop1,
    toStop1: colours.bad.stop1,
  },
  {
    name: 'colourBase',
    fromStop0: colours.bad.stop0,
    toStop0: colours.base.stop0,
    fromStop1: colours.bad.stop1,
    toStop1: colours.base.stop1,
  },
];

// The object to tween to and from.
const colourStops = {
  stop0: null,
  stop1: null,
};

// When scrolling back to start from the end of the story,
// the bottle wave points are below the bottle from the model.
// app. We simply set them to above the bottle neck.
function fillUpBottleWave() {
  state.bottleWave.wavePoints = [
    [0, -20],
    [state.width, -20],
  ];
}

// Render.
function renderBottleColour() {
  requestAnimationFrame(() => {
    // Save contexts.
    state.ctx.bottleWave.save();
    state.ctx.glassBottle.save();

    // Set context styles.
    const gradient = getGradient(colourStops);
    state.ctx.bottleWave.fillStyle = gradient;
    state.ctx.glassBottle.strokeStyle = gradient;

    // Set the bottle wave line to be above bottle.
    fillUpBottleWave();

    // Draw.
    drawBottleWave(
      state.ctx.bottleWave,
      state.bottleWave.bottlePath,
      state.transform.shape
    );
    drawBottle(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.transform.bottle
    );

    // Restore contexts.
    state.ctx.bottleWave.restore();
    state.ctx.glassBottle.restore();
  });
}

// Tween set up.
function defineTweenBottleColour(col) {
  const tl = gsap.timeline({ onUpdate: renderBottleColour });

  const stop0Tween = gsap.fromTo(
    colourStops,
    { stop0: col.fromStop0 },
    { stop0: col.toStop0 }
  );

  const stop1Tween = gsap.fromTo(
    colourStops,
    { stop1: col.fromStop1 },
    { stop1: col.toStop1 }
  );

  return tl.add(stop0Tween).add(stop1Tween, '<');
}

function tweenBottleColour() {
  bottleColours.forEach(d => {
    // Capture current progress.
    const scroll = ScrollTrigger.getById(d.name);
    const progress = scroll ? scroll.progress : 0;

    // Kill old - set up new timeline.
    if (state.tween[d.name]) state.tween[d.name].kill();
    state.tween[d.name] = defineTweenBottleColour(d);
    state.tween[d.name].totalProgress(progress);
  });
}

export default tweenBottleColour;
export { bottleColours };
