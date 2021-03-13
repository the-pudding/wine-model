/* eslint-disable no-use-before-define */
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';

import state from '../app/state';
import { defineTweenBottleWave } from './bottleWave';

function tweenBottleEmpty() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleEmpty');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleEmpty) state.tween.bottleEmpty.kill();
  state.tween.bottleEmpty = defineTweenBottleWave(0.6, -0.1);
  state.tween.bottleEmpty.totalProgress(progress);
}

export default tweenBottleEmpty;
