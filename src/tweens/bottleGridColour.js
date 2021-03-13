/* eslint-disable no-use-before-define */
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';

import state from '../app/state';
import { renderBottleGrid } from './bottleGrid';

function defineTweenBottleGridColour() {
  // Tween
  const tl = gsap.timeline({ onUpdate: renderBottleGrid });

  // For shortness.
  const colours = state.bottleColour;

  // Tween from the base to a good gradient.
  const colourGood0 = gsap.fromTo(
    state.bottleGrid.colour.good,
    { stop0: colours.base.stop0 },
    { stop0: colours.good.stop0 }
  );

  const colourGood1 = gsap.fromTo(
    state.bottleGrid.colour.good,
    { stop1: colours.base.stop1 },
    { stop1: colours.good.stop1 }
  );

  // Tween from the base to a bad gradient.
  const colourBad0 = gsap.fromTo(
    state.bottleGrid.colour.bad,
    { stop0: colours.base.stop0 },
    { stop0: colours.bad.stop0 }
  );

  const colourBad1 = gsap.fromTo(
    state.bottleGrid.colour.bad,
    { stop1: colours.base.stop1 },
    { stop1: colours.bad.stop1 }
  );

  return tl
    .add(colourGood0)
    .add(colourGood1, '<')
    .add(colourBad0)
    .add(colourBad1, '<');
}

function tweenBottleGridColour() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleGridColour');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleGridColour) state.tween.bottleGridColour.kill();
  state.tween.bottleGridColour = defineTweenBottleGridColour();
  state.tween.bottleGridColour.totalProgress(progress);
}

export default tweenBottleGridColour;
