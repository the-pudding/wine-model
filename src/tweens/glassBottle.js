import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { drawScape } from './wineScape';
import state from '../app/state';

// bottle outline in the respective colours
function drawBottle(ctx, path, t) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const l = segment.length;
    ctx.moveTo(segment[0], segment[1]);
    for (let j = 2; j < l; j += 6) {
      ctx.bezierCurveTo(
        segment[j],
        segment[j + 1],
        segment[j + 2],
        segment[j + 3],
        segment[j + 4],
        segment[j + 5]
      );
    }
    if (segment.closed) {
      ctx.closePath();
    }
  }
  ctx.stroke();
  ctx.restore();
}

function renderBottle() {
  requestAnimationFrame(() => {
    // We need to draw on both contexts here, as the tween doesn't only cover
    // paramaters for the glassBottle but also the alpha for the scape context.
    drawScape(
      state.ctx.scape,
      state.scape.image,
      state.transform.scape,
      state.scape.alpha
    );

    state.ctx.glassBottle.save();
    state.ctx.glassBottle.strokeStyle = state.glassBottle.colour;
    drawBottle(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.transform.shape
    );
    state.ctx.glassBottle.restore();
  });
}

function defineTweenGlassBottle() {
  const tl = gsap.timeline({ onUpdate: renderBottle });

  const morph = gsap.to('#glass-path', {
    morphSVG: {
      shape: '#bottle-path',
      map: 'complexity',
      updateTarget: false,
      render(path) {
        state.glassBottle.path = path;
      },
    },
  });

  const colourvalue = gsap.fromTo(
    state.glassBottle,
    { colour: 'rgba(0, 0, 0, 0)' },
    {
      colour: 'rgba(0, 0, 0, 1)',
      ease: 'circ.out',
    }
  );

  const retransform = gsap.fromTo(
    state.transform.shape,
    {
      x: state.transform.scape.x,
      y: state.transform.scape.y,
      scale: state.transform.scape.scale,
    },
    {
      x: state.transform.bottle.x,
      y: state.transform.bottle.y,
      scale: state.transform.bottle.scale,
      ease: 'none',
    }
  );

  const imagealpha = gsap.fromTo(
    state.scape,
    { alpha: 1 },
    { alpha: state.scape.alphaTarget }
  );

  return tl
    .add(retransform, 0)
    .add(colourvalue, 0)
    .add(morph, 0)
    .add(imagealpha, 0);
}

function tweenGlassBottle() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('glassBottle');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.glassBottle) state.tween.glassBottle.kill();
  state.tween.glassBottle = defineTweenGlassBottle();
  state.tween.glassBottle.totalProgress(progress);
}

export default tweenGlassBottle;
export { drawBottle };
