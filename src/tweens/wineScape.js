import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';

function drawScape(ctx, img, t, alpha) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.restore();
}

function renderScape() {
  requestAnimationFrame(() =>
    drawScape(
      state.ctx.scape,
      state.scape.image,
      state.transform.scape,
      state.scape.alpha
    )
  );
}

function defineTweenWineScape() {
  const tl = gsap.timeline({ onUpdate: renderScape });
  const imagealpha = gsap.fromTo(state.scape, { alpha: 0 }, { alpha: 1 });
  return tl.add(imagealpha, 0);
}

function tweenWineScape() {
  // Capture current progress.
  const scroll = ScrollTrigger.getById('wineScape');
  const progress = scroll ? scroll.progress : 0;

  // Kill old - set up new timeline.
  if (state.tween.wineScape) state.tween.wineScape.kill();
  state.tween.wineScape = defineTweenWineScape();
  state.tween.wineScape.totalProgress(progress);
}

export default tweenWineScape;
export { drawScape };
