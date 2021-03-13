/* eslint-disable no-use-before-define */
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';

import state from '../app/state';
import { defineTweenBottleWave } from './bottleWave';

function tweenBottleFill() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleFill');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleFill) state.tween.bottleFill.kill();
  state.tween.bottleFill = defineTweenBottleWave(-0.1, 1.05);
  state.tween.bottleFill.totalProgress(progress);
}

export default tweenBottleFill;
