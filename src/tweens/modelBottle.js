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
function drawPaths(ctx, paths, t, length, offset, alpha) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.setLineDash([length - offset, offset]);
  // eslint-disable-next-line no-unused-expressions
  Array.isArray(paths)
    ? paths.forEach(path => ctx.stroke(path))
    : ctx.stroke(paths);

  ctx.restore();
}

function renderModelBottle() {
  requestAnimationFrame(() => {
    drawPaths(
      state.ctx.glassBottle,
      state.modelBottle.paths,
      state.transform.shape,
      state.modelBottle.maxLength,
      state.modelBottle.dashOffset,
      state.modelBottle.alpha
    );
  });
}

function defineTweenModelBottle(offsetDraw, alphaStart, alphaTarget) {
  const tl = gsap.timeline({ onUpdate: renderModelBottle });

  const offsetIn = gsap.fromTo(
    state.modelBottle,
    { dashOffset: state.modelBottle.maxLength },
    { dashOffset: 0 }
  );

  const offsetOut = gsap.fromTo(
    state.modelBottle,
    { dashOffset: 0 },
    { dashOffset: state.modelBottle.maxLength }
  );

  const alphavalue = gsap.fromTo(
    state.modelBottle,
    { alpha: alphaStart },
    { alpha: alphaTarget }
  );

  return tl.add(offsetDraw ? offsetIn : offsetOut).add(alphavalue, 0);
}

function tweenIn() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('modelBottleIn');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.modelBottleIn) state.tween.modelBottleIn.kill();
  state.tween.modelBottleIn = defineTweenModelBottle(true, 0, 1);
  state.tween.modelBottleIn.totalProgress(progress);
}

function tweenOut() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('modelBottleOut');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.modelBottleOut) state.tween.modelBottleOut.kill();
  state.tween.modelBottleOut = defineTweenModelBottle(false, 1, 0);
  state.tween.modelBottleOut.totalProgress(progress);
}

function tweenModelBottle() {
  tweenIn();
  // tweenOut(); // not needed but here for if and when required.
}

export default tweenModelBottle;
