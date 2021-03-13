import { mean } from 'd3-array';
import { format } from 'd3-format';
import gsap from 'gsap';
import state from '../app/state';

let position = {};
const lw = 20;
const lh = 3;
const pad = 5;
const perc = format('.0%');
const fontSize = 8;

// Draw and render.
function drawWaveMarkers(ctx, t, path) {
  const rough = state.rough.chart;
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);

  ctx.globalAlpha = state.modelWave.alpha;

  // Line
  ctx.lineWidth = 0.1;
  ctx.beginPath();
  rough.line(position.x / 2, position.y, position.x + lw, position.y, {
    seed: 1,
  });
  ctx.stroke();

  // ...marker
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  rough.line(
    position.x + lw,
    position.y - lh,
    position.x + lw,
    position.y + lh,
    {
      seed: 1,
    }
  );
  ctx.stroke();

  // Main text (probability).
  ctx.textBaseline = 'middle';
  ctx.font = `${fontSize}px Signika`;
  ctx.fillText(
    `${perc(state.model.probability)} likely to be good`,
    position.x + lw + pad,
    position.y + 1
  );

  // Subtitle (tips).
  ctx.font = `${Math.floor(fontSize * 0.9)}px Signika`;
  ctx.fillStyle = state.modelBottle.infoColour;
  // This is an array of text with each element getting its own line...
  state.modelBottle.info.forEach((d, i) => {
    const sublineOffset = i === 0 ? 2 : 0;
    ctx.fillText(
      d,
      position.x + lw + pad,
      position.y + (i + 1) * (fontSize + 2) + sublineOffset
    );
  });

  // Clip.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = 1; // to be safe.
  ctx.translate(5, 0);
  ctx.fill(path);

  ctx.restore();
}

function renderWaveMarkers() {
  requestAnimationFrame(() => {
    drawWaveMarkers(
      state.ctx.chart,
      state.transform.shape,
      state.bottleWave.bottlePath
    );
  });
}

// Make.
function makeWaveMarkers() {
  // Prep.
  const wave = state.bottleWave;
  if (!wave.wavePoints || !wave.wavePoints.length) return;

  // A more or less steady y position.
  const h = state.glassBottle.bottleBox.height;
  let y = mean(wave.wavePoints, d => d[1]);
  if (y > h * 0.98) y = h * 0.98;
  if (y < h * 0.005) y = h * 0.005;

  // Position will be picked up by the draw function.
  position = {
    x: wave.wavePoints[wave.wavePoints.length - 1][0],
    y,
  };

  // Render it.
  renderWaveMarkers();
}

// Control the marker funcs.
function startWaveMarkers() {
  gsap.ticker.add(makeWaveMarkers);
}

function stopWaveMarkers() {
  gsap.ticker.remove(makeWaveMarkers);
}

export { startWaveMarkers, stopWaveMarkers };
