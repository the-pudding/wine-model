import isequal from 'lodash.isequal';

/**
 * Calculates the Logistic Regression probability for the
 * given values based on the given model parameters.
 * @param { map } values map of the values
 * @param { map } weights map of the weights
 * @param { number } intercept the model intercept
 */
function getProbability(values, weights, intercept) {
  const check = isequal(values.keys(), weights.keys());
  if (!check) throw Error('values and weights are not equal.');

  let logOdds = intercept;
  values.keys().forEach(variable => {
    logOdds += values.get(variable) * weights.get(variable);
  });

  const odds = Math.exp(logOdds);
  const prob = odds / (1 + odds);
  return prob;
}

export default getProbability;
