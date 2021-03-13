import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';

/**
 * Draws a path at a certain offset of its full length.
 * Can nicely be used to animate a path.
 * @param { Object } ctx Context to draw on
 * @param { Array|String} paths Path(s) to draw
 * @param { Object } t transform to apply to context
 * @param { Number } length Max length of the (longest) path
 * @param { Number } offset Length of the path to draw (ideally animated)
 */
function drawTextPath(ctx, paths, t, length, offset) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  state.ctx.bottleText.strokeStyle = state.bottleText.colour;
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.setLineDash([length - offset, offset]);
  // eslint-disable-next-line no-unused-expressions
  Array.isArray(paths)
    ? paths.forEach(path => ctx.stroke(path))
    : ctx.stroke(paths);
  ctx.restore();
}

function renderBottleText() {
  requestAnimationFrame(() => {
    state.ctx.bottleText.save();
    state.ctx.bottleText.lineWidth = 0.7;
    drawTextPath(
      state.ctx.bottleText,
      state.bottleText.paths,
      state.transform.shape,
      state.bottleText.maxLength,
      state.bottleText.dashOffset
    );
    state.ctx.bottleText.restore();
  });
}

function defineTweenBottleText(offsetDraw, alphaStart, alphaTarget) {
  const tl = gsap.timeline({ onUpdate: renderBottleText });

  const offsetIn = gsap.fromTo(
    state.bottleText,
    { dashOffset: state.bottleText.maxLength },
    { dashOffset: 0 }
  );

  const offsetOut = gsap.fromTo(
    state.bottleText,
    { dashOffset: 0 },
    { dashOffset: state.bottleText.maxLength }
  );

  const colourvalue = gsap.fromTo(
    state.bottleText,
    { colour: `rgba(0, 0, 0, ${alphaStart})` },
    {
      colour: `rgba(0, 0, 0, ${alphaTarget})`,
      ease: 'circ.out',
    }
  );

  return tl.add(offsetDraw ? offsetIn : offsetOut).add(colourvalue, 0);
}

function tweenBottleText() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('bottleText');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.bottleText) state.tween.bottleText.kill();
  state.tween.bottleText = defineTweenBottleText(true, 0, 1);
  state.tween.bottleText.totalProgress(progress);
}

export default tweenBottleText;
export { defineTweenBottleText };
