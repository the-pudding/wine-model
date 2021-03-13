import { select } from 'd3-selection';

import state from '../app/state';
import buildControl from './densityControl';

function buildModelControls() {
  // Sort the controls by their variable importance.
  const order = state.varImp.data.map(d => d.variable);
  const controlData = state.model.values.entries();
  controlData.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  // Mount the app.
  select('#model-app-wrap')
    .selectAll('.model-value-control')
    .data(controlData)
    .join('div')
    .attr('class', 'model-value-control')
    .each(buildControl);
}

export default buildModelControls;
