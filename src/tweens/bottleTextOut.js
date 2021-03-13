/* eslint-disable no-use-before-define */
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';

import state from '../app/state';
import { defineTweenBottleText } from './bottleText';

function tweenBottleTextOut() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleTextOut');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleTextOut) state.tween.bottleTextOut.kill();
  state.tween.bottleTextOut = defineTweenBottleText(false, 1, 0);
  state.tween.bottleTextOut.totalProgress(progress);
}

export default tweenBottleTextOut;
