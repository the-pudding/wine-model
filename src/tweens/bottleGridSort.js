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
      state.bottleGrid.dataTarget
    );
    drawBottles(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.bottleGrid.dataTarget
    );
  });
}
function defineTweenBottleGridSort() {
  const tl = gsap.timeline({ onUpdate: renderBottleGridSorted });

  const pointtween = gsap.to(
    state.bottleGrid.dataTarget.map(d => d.layout),
    {
      x: i => state.bottleGrid.dataSorted[i].layout.x,
      y: i => state.bottleGrid.dataSorted[i].layout.y,
      scale: i => state.bottleGrid.dataSorted[i].layout.scale,
      stagger: 0.01,
    }
  );

  return tl.add(pointtween);
}

function tweenBottleGridSort() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleGridSort');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleGridSort) state.tween.bottleGridSort.kill();
  state.tween.bottleGridSort = defineTweenBottleGridSort();
  state.tween.bottleGridSort.totalProgress(progress);
}

export default tweenBottleGridSort;
