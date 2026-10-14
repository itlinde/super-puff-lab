import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/syncopate/700.css';
import './styles/main.css';
import { Stage } from './stage/Stage';
import { fitWordmark } from './stage/wordmark';
import { mountReviewPanel, initialStateFromUrl } from './dev/reviewPanel';

const params = new URLSearchParams(location.search);
if (params.get('bare') === '1') document.body.classList.add('bare'); // screenshots: hide wordmark + grain
const canvas = document.querySelector<HTMLCanvasElement>('.stage')!;
const state = initialStateFromUrl(params);

const stage = new Stage(canvas, state, { orbit: true });
const yaw = Number(params.get('yaw') ?? 0);
stage.setYaw(yaw);

const wordmark = document.querySelector<HTMLElement>('.wordmark__text')!;
const wordmarkMode = () => (document.body.dataset.wordmark === 'tall' ? 'tall' : 'natural');
document.body.dataset.wordmark = params.get('wordmark') ?? 'natural';
document.fonts.ready.then(() => fitWordmark(wordmark, wordmarkMode()));
window.addEventListener('resize', () => fitWordmark(wordmark, wordmarkMode()));

if (params.get('panel') !== '0') {
  mountReviewPanel(state, (s) => stage.setVariant(s), (mode) => {
    document.body.dataset.wordmark = mode;
    fitWordmark(wordmark, mode);
  });
}

const loop = () => {
  stage.render();
  requestAnimationFrame(loop);
};
loop();
(window as unknown as { __ready: boolean }).__ready = true;
