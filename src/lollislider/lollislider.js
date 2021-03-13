/* eslint-disable prefer-destructuring */
import { select } from 'd3-selection';
import { map } from 'd3-collection/src';
import state from '../app/state';
import { renderLolliChart } from '../tweens/lolliChart';
import getProbability from '../model/probability';

// Our fantasy lr model parameters.
const intercept = 0;
const weights = map();
weights.set('acids', -3);
weights.set('sugars', 1.5);
weights.set('alcohol', 3);

// The model values.
const values = map();

function updateValues() {
  values.set('acids', state.lolli.data.acids.value);
  values.set('sugars', state.lolli.data.sugars.value);
  values.set('alcohol', state.lolli.data.alcohol.value);
}

function slide() {
  const { name, value } = this;

  // Set input values.
  state.lolli.data[name].value = +value;
  state.lolli.data[name].values[3] = +value;

  // Set quality values.
  updateValues();
  const quality = getProbability(values, weights, intercept);
  state.lolli.data.quality.value = +quality;
  state.lolli.data.quality.values[3] = quality;

  // render chart
  renderLolliChart();
}

function setupLolliSlider() {
  select('#slider-tool')
    .selectAll('input')
    .each(function () {
      // Set initial value.
      const { name } = this;
      this.value = state.lolli.data[name].values[3];
    })
    .on('input', slide);
}

export default setupLolliSlider;
