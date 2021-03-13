/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import cloneDeep from 'lodash.clonedeep';

function gridLayout() {
  let rows = 15;
  let cols = 15;
  let scale = 0.15;
  let points = [];

  // Add layout to original data.
  function augmentData(baseData, grid) {
    baseData.forEach((d, i) => {
      d.layout = {
        x: grid[i].x,
        y: grid[i].y,
        scale: grid[i].scale,
      };
    });
  }

  // Layout function.
  function layout(data) {
    // Test.
    if (rows * cols !== data.length)
      throw Error('data needs to have rows * col length');

    // Build layout.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const point = {
          x: Math.round((c / (cols - 1)) * 1e5) / 1e5,
          y: Math.round((r / (rows - 1)) * 1e5) / 1e5,
          scale,
        };
        points.push(point);
      }
    }

    // Clone and augment original data.
    const dataCloned = data.map(d => cloneDeep(d));
    augmentData(dataCloned, points);

    return dataCloned;
  }

  // Getters|Setters.
  layout.rows = _ => (_ ? ((rows = _), layout) : rows);
  layout.cols = _ => (_ ? ((cols = _), layout) : cols);
  layout.scale = _ => (_ ? ((scale = _), layout) : scale);

  return layout;
}

export default gridLayout;
