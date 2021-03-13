import state from '../app/state';
import { startWave, stopWave, decayWave } from './bottleWave';
import { startWaveMarkers, stopWaveMarkers } from './modelWaveMarker';

// These functions are triggered directly by the scroll trigger
// as the tweening malarky wasn't fun and piled up edge cases.

const subBottle = -0.1;

// Scroll from below bottle to the current probability.
function updateModelWave(scroll) {
  state.modelBottle.points = true;
  state.bottleWave.lift =
    subBottle + scroll.progress * (state.model.probability - subBottle);
  state.modelWave.alpha = scroll.progress;
  startWave();
  decayWave();
  startWaveMarkers();
}

// Stop all wavey things when scrolling back up the story.
function stopModelWave() {
  state.modelBottle.points = false;
  stopWaveMarkers();
  stopWave();
}

// Called each time on update (e.g. resize) to start, stop
// any action based on the flags set in the control funs above ↑.
function checkModelWave() {
  if (state.modelBottle.points) {
    startWave();
    startWaveMarkers();
  } else {
    stopWave();
    stopWaveMarkers();
  }
}

export { updateModelWave, stopModelWave, checkModelWave };
