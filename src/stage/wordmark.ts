/**
 * Fits the wordmark to the viewport width. "natural" keeps the typeface's
 * proportions; "tall" stretches it vertically to match the mockup's
 * composition (the wordmark filling the top ~40% of the screen).
 */
export function fitWordmark(el: HTMLElement, mode: 'natural' | 'tall') {
  el.style.fontSize = '100px';
  el.style.transform = 'none';
  const target = window.innerWidth * 0.94;
  const size = (100 * target) / el.scrollWidth;
  el.style.fontSize = `${size}px`;
  if (mode === 'tall') {
    const h = el.getBoundingClientRect().height;
    const want = window.innerHeight * 0.4;
    el.style.transform = `scaleY(${(want / h).toFixed(3)})`;
  }
}
