import { map } from 'd3-collection';
import state from '../app/state';

// This module produces an info sentence if the user
// moves a variable value across a defined threshold.
// This info (and a good/bad/neutral colour) will be
// picked up by the marker draw function to add the info text.

const info = [
  {
    variable: 'alcohol',
    operator: '>',
    threshold: 13,
    info: ['our model likes alcohol!'],
    infoColour: state.bottleColour.good.stop1,
  },
  {
    variable: 'volatile_acidity',
    operator: '>',
    threshold: 0.9,
    info: ['careful, your wine might', 'get too acid-reach'],
    infoColour: state.bottleColour.bad.stop1,
  },
  {
    variable: 'sulphates',
    operator: '<',
    threshold: 0.5,
    info: [''],
    infoColour: state.bottleColour.bad.stop1,
  },
  {
    variable: 'density',
    operator: '',
    threshold: null,
    info: [''],
    infoColour: '',
  },
  {
    variable: 'citric_acid',
    operator: '>',
    threshold: 0.35,
    info: [''],
    infoColour: state.bottleColour.good.stop1,
  },
  {
    variable: 'chlorides',
    operator: '>',
    threshold: 0.1,
    info: ["don't oversalt it"],
    infoColour: state.bottleColour.bad.stop1,
  },
  {
    variable: 'total_sulfur_dioxide',
    operator: '',
    threshold: null,
    info: [''],
    infoColour: '',
  },
  {
    variable: 'fixed_acidity',
    operator: '>',
    threshold: 8.5,
    info: [''],
    infoColour: state.bottleColour.bad.stop1,
  },
  { variable: 'ph', operator: '', threshold: null, info: [''], infoColour: '' },
  {
    variable: 'residual_sugar',
    operator: '>',
    threshold: 3.8,
    info: ['getting on the sweeter', 'side for a red wine now'],
    infoColour: '#777',
  },
  {
    variable: 'free_sulfur_dioxide',
    operator: '',
    threshold: null,
    info: [''],
    infoColour: '',
  },
];

const infoMap = map(info, d => d.variable);

function getConditional(value, operator, threshold) {
  if (operator === '' || !operator) return false;
  if (operator === '>') return value > threshold;
  if (operator === '<') return value < threshold;
}

/**
 * Return info for that variable  based on the given value.
 * @param { string } variable property at question
 * @param { number } value the current value
 */
function setPropertyInfo(variable, value) {
  state.modelBottle.info = [''];
  state.modelBottle.infoColour = '';
  const current = infoMap.get(variable);
  const conditional = getConditional(
    value,
    current.operator,
    current.threshold
  );
  if (conditional) {
    state.modelBottle.info = current.info;
    state.modelBottle.infoColour = current.infoColour;
  }
}

export default setPropertyInfo;
