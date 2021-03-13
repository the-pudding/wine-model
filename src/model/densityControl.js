/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
/* eslint-disable no-cond-assign */
/* eslint-disable no-return-assign */
import { max, mean } from 'd3-array/src';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale/src';
import { select, event } from 'd3-selection';
import { curveBasis, line } from 'd3-shape/src';
import rough from 'roughjs/bundled/rough.esm';

import state from '../app/state';
import getProbability from './probability';
import setPropertyInfo from './propertyInfo';
import { prettyLabel } from '../app/utils';
import { decayWave } from '../tweens/bottleWave';

// Module state.
const margin = { top: 20, right: 20, bottom: 30, left: 20 };

// Function to compute density
function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [
        x,
        mean(V, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}

// Control build function.
function buildControl(datapoint, i) {
  // Get the datum's values.
  const variable = datapoint.key;
  let { value } = datapoint;

  // Identify # of decimals to show.
  const valueRange = state.model.ranges.get(variable);
  const rangeDelta = valueRange[1] - valueRange[0];
  const decimals = rangeDelta > 0.09 ? 2 : 3;

  // Set up.
  const sel = select(this);
  sel.select('svg').remove(); // No join mechanics here - let's be deterministic.
  const svg = sel.append('svg').attr('class', 'control');
  const rs = rough.svg(svg.node());

  // SVG is defined as 100% width/height in CSS.
  const width = parseInt(svg.style('width'), 10) - margin.left - margin.right;
  const height = parseInt(svg.style('height'), 10) - margin.top - margin.bottom;

  // Clip path for the marker.
  const clippy = svg
    .append('defs')
    .append('clipPath')
    .attr('id', `clippy-${variable}`)
    .append('path');

  // The chart g.
  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // x Scale.
  const xScale = scaleLinear()
    .domain(state.model.ranges.get(variable))
    .range([0, width]);

  // Label.
  const labelText = variable === 'ph' ? 'pH' : prettyLabel(variable);
  g.append('text')
    .attr('x', width)
    .attr('y', -margin.top / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .style('font-family', 'Signika')
    .style('font-size', 12)
    .text(labelText);

  // Axis.
  g.append('line')
    .attr('y1', height)
    .attr('x2', width)
    .attr('y2', height)
    .style('stroke-width', 1)
    .style('stroke', '#000');

  // Build axis labels only for first chart.
  if (i === 0) {
    const axisLabel = g
      .append('g')
      .attr('class', 'axis-label')
      .style('font-family', 'Signika')
      .style('font-size', 12)
      .style('fill', '#555');

    axisLabel
      .append('text')
      .text('less')
      .attr('x', 0)
      .attr('y', height)
      .attr('dy', '1em')
      .style('text-anchor', 'start');

    axisLabel
      .append('text')
      .text('more')
      .attr('x', width)
      .attr('y', height)
      .attr('dy', '1em')
      .style('text-anchor', 'end');
  }

  // Density data.
  const k =
    (state.model.ranges.get(variable)[1] -
      state.model.ranges.get(variable)[0]) *
    0.05;
  const kde = kernelDensityEstimator(kernelEpanechnikov(k), xScale.ticks(40));
  const density = kde(state.stats.data.map(d => d[variable]));

  // Add a start and an end point at x = 0 to the mix.
  density.unshift([density[0][0], 0]);
  density.push([density[density.length - 1][0], 0]);

  // y Scale.
  const yScale = scaleLinear()
    .domain([0, max(density.map(d => d[1]))])
    .range([height, 0]);

  // Line generator.
  const lineGen = line()
    .curve(curveBasis)
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  // Get density path.
  const densityPath = lineGen(density);

  // Density chart.
  const fill = rs.path(densityPath, {
    fill: '#555',
    stroke: 'rgba(0, 0, 0, 0.7)',
  });
  g.node().appendChild(fill);
  g.select('path').attr('class', `density ${variable}`);

  // Clip path data.
  clippy.attr('d', densityPath);

  // Position data for the drag subjects.
  const position = {
    x: xScale(value),
    y: height,
    width: 30,
    height: height + margin.bottom,
  };

  // Marker.
  g.append('line')
    .datum(position)
    .attr('x1', d => d.x)
    .attr('y1', d => d.y)
    .attr('x2', d => d.x)
    .attr('y2', 0)
    .attr('class', 'marker')
    .attr('clip-path', `url(#clippy-${variable})`)
    .style('stroke-width', 1)
    .style('stroke', 'black');

  // Handle.
  g.append('circle')
    .datum(position)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 5)
    .attr('class', 'handle')
    .style('fill', '#000');

  // Number.
  g.append('text')
    .datum(position)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('class', 'label')
    .attr('dy', i ? '0.7em' : '0.9em')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .style('font-family', 'Signika')
    .style('font-size', 12)
    .text(value.toFixed(decimals));

  // Drag handler.
  function handleDrag(datum) {
    // Clamp the x value.
    const x = event.x > width ? width : event.x < 0 ? 0 : event.x;

    // Update the data.
    value = xScale.invert(x);
    state.model.values.set(variable, value);
    state.model.probability = getProbability(
      state.model.values,
      state.model.weights,
      state.model.intercept
    );

    // Operate the bottle wave on change.
    decayWave();
    state.bottleWave.lift = state.model.probability;

    // Update DOM.
    const dragrect = select(this);
    const circle = select(this.parentNode).select('circle.handle');
    const marker = select(this.parentNode).select('line.marker');
    const label = select(this.parentNode).select('text.label');

    dragrect.attr('x', () => {
      datum.x = x;
      return datum.x - datum.width / 2;
    });

    circle.attr('cx', (datum.x = x));
    marker.attr('x1', (datum.x = x)).attr('x2', (datum.x = x));
    label.attr('x', (datum.x = x)).text(value.toFixed(decimals));

    // Add some wine making tips to the canvas indirectly.
    setPropertyInfo(variable, value);
  }

  // Drag rectangle.
  g.append('rect')
    .datum(position)
    .attr('x', d => d.x - d.width / 2)
    .attr('y', 0)
    .attr('width', d => d.width)
    .attr('height', d => d.height)
    .style('opacity', 0) // can't see it - no no.
    .call(drag().on('drag', handleDrag));
}

export default buildControl;
