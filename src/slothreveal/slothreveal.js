import { select, selectAll } from 'd3-selection';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import state from '../app/state';
import sloth from '../../static/animal-sloth-2b';
import { renderAnimals } from '../tweens/animals';

function clicked() {
  const slothArrays = MorphSVGPlugin.stringToRawPath(sloth);
  state.glassBottle.path = slothArrays;
  renderAnimals();

  select('#sloth-reveal').classed('show', true);
  select('#sloth-reveal-delay').classed('show', true);

  selectAll('.sloth-button').classed('clicked-true clicked-false', false);
  select(this).classed(`clicked-${this.dataset.answer}`, true);
}

function slothReveal() {
  selectAll('.sloth-button').on('mousedown', clicked);
}

export default slothReveal;
