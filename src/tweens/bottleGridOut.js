/* eslint-disable no-use-before-define */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';

import state from '../app/state';
import { drawBottleWaves, drawBottles } from './bottleGrid';

function renderBottleGridSorted() {
  requestAnimationFrame(() => {
    drawBottleWaves(
      state.ctx.bottleWave,
      state.bottleWave.bottlePath,
      state.bottleGrid.dataSorted
    );
    drawBottles(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.bottleGrid.dataSorted
    );
  });
}

function defineTweenBottleGridOut() {
  const tl = gsap.timeline({ onUpdate: renderBottleGridSorted });

  const pointtween = gsap.to(
    state.bottleGrid.dataSorted.map(d => d.layout),
    {
      x: i => state.bottleGrid.dataOut[i].layout.x,
      y: i => state.bottleGrid.dataOut[i].layout.y,
      scale: i => state.bottleGrid.dataOut[i].layout.scale,
      stagger: 0.01,
    }
  );

  return tl.add(pointtween);
}

function tweenBottleGridOut() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleGridOut');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleGridOut) state.tween.bottleGridOut.kill();
  state.tween.bottleGridOut = defineTweenBottleGridOut();
  state.tween.bottleGridOut.totalProgress(progress);
}

export default tweenBottleGridOut;
