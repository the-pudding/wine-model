/* eslint-disable no-return-assign */
/* eslint-disable prefer-spread */
import { extent, ticks } from 'd3-array/src';
import { nest } from 'd3-collection/src';
import { scaleLinear, scalePoint } from 'd3-scale/src';

/**
 * Build sensible bin values (with d3's tick func),
 * return a snap function that snaps continuous
 * values to these bin centres.
 * Also return a scale for the snapped values.
 */
function getXScaleTools(data, variable) {
  const domain = extent(data, d => d[variable]);
  const tickArray = ticks(domain[0], domain[1], 12);
  const scale = scalePoint().domain(tickArray);

  function snap(number) {
    return tickArray.reduce((a, b) => {
      return Math.abs(b - number) < Math.abs(a - number) ? b : a;
    });
  }

  return { scale, snap };
}

/**
 * Nest by the snapped x values,
 * enumerate each value per group from 0 to max in the group,
 * scale each value from 0 to 1,
 * return a map by id to let the user combine this data in the app.
 */
function getYValueMap(data, variable, snap) {
  // Split and Apply... (Combine happens in the main func).
  const nested = nest()
    .key(d => snap(d[variable]))
    .rollup(v => v.map((d, i) => ({ id: d.id, y: i })))
    .entries(data);

  // Unnest the results...
  const unnested = nested.map(d => d.value);
  const flattened = [].concat.apply([], unnested);

  // Scale y values to [0, 1].
  const yScale = scaleLinear().domain(extent(flattened, d => d.y));

  // Get a map of values by the data's id variable.
  const flatMap = nest()
    .key(d => d.id)
    .rollup(v => yScale(v[0].y))
    .map(flattened);

  return flatMap;
}

function frequency() {
  let variable; // The data variable.
  let id = 'id'; // The unique numerical row identifier variable.

  function layout(data) {
    // xValues.
    const xTools = getXScaleTools(data, variable);
    const yMap = getYValueMap(data, variable, xTools.snap);

    // Get the layout in an array.
    const result = data.map(d => ({
      id: d[id],
      x: xTools.scale(xTools.snap(d[variable])),
      y: yMap.get(d[id]),
      value: xTools.snap(d[variable]),
    }));

    // Get the layout in a map by `id` which needs to be in
    // the dataset this layout gets joined by.
    const resultMap = nest()
      .key(d => d[id])
      .rollup(v => ({ x: v[0].x, y: v[0].y, value: v[0].value }))
      .map(result);

    return resultMap;
  }

  layout.variable = _ => (_ ? ((variable = _), layout) : variable);
  layout.id = _ => (_ ? ((id = _), layout) : id);

  return layout;
}

export default frequency;
