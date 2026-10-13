// TEMPORARY: slice-2 review panel so Isabella can flip through every jacket
// setting. Replaced by the real controls in slice 4.
import { COLOUR_HEX, FABRICS, FAMILIES, LENGTHS, VARIANTS, type Family, type FabricId, type Length, type Sleeves } from '../data/variants';
import type { JacketState } from '../jacket/Jacket';

export function initialStateFromUrl(p: URLSearchParams): JacketState {
  const colourName = (p.get('colour') ?? 'VILLA PINK').toUpperCase();
  return {
    family: (p.get('family') as Family) ?? 'super-puff',
    length: (p.get('length') as Length) ?? 'original',
    sleeves: (p.get('sleeves') as Sleeves) ?? 'sleeves',
    fabric: (p.get('fabric') as FabricId) ?? 'climatte',
    colour: COLOUR_HEX[colourName] ?? colourName,
  };
}

export function mountReviewPanel(
  initial: JacketState,
  onChange: (s: JacketState) => void,
  onWordmark: (mode: 'natural' | 'tall') => void,
) {
  const state = { ...initial };
  const el = document.createElement('aside');
  el.className = 'review';
  const opt = (v: string, l: string, sel: boolean) => `<option value="${v}"${sel ? ' selected' : ''}>${l}</option>`;
  const colourEntry = Object.entries(COLOUR_HEX).find(([, hex]) => hex === state.colour);
  el.innerHTML = `
    <h2>Slice 2 review</h2>
    <label><span>Fit</span><select name="family">${FAMILIES.map((f) => opt(f.id, `${f.fitLabel} — ${f.label}`, f.id === state.family)).join('')}</select></label>
    <label><span>Length</span><select name="length">${LENGTHS.map((l) => opt(l.id, l.label, l.id === state.length)).join('')}</select></label>
    <label><span>Sleeves</span><select name="sleeves">${opt('sleeves', 'Sleeves', state.sleeves === 'sleeves')}${opt('vest', 'Vest', state.sleeves === 'vest')}</select></label>
    <label><span>Fabric</span><select name="fabric">${FABRICS.map((f) => opt(f.id, f.label, f.id === state.fabric)).join('')}</select></label>
    <label><span>Colour (placeholder hex)</span><select name="colour">${Object.entries(COLOUR_HEX).map(([n, hex]) => opt(hex, n, colourEntry?.[0] === n)).join('')}</select></label>
    <label><span>Wordmark</span><select name="wordmark">${opt('natural', 'Natural proportions', true)}${opt('tall', 'Tall, like the mockup', false)}</select></label>
    <div class="variant-name"></div>
    <p>Drag the jacket to rotate. Every combination is buildable here; in the real controls, combinations Aritzia doesn't sell will be greyed out.</p>`;
  document.body.appendChild(el);

  const nameEl = el.querySelector('.variant-name')!;
  const updateName = () => {
    const v = VARIANTS.find((x) => x.family === state.family && x.length === state.length && x.sleeves === state.sleeves && x.fabric === state.fabric);
    nameEl.textContent = v ? v.name : 'Not sold by Aritzia';
  };
  updateName();

  el.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.name === 'wordmark') return onWordmark(t.value as 'natural' | 'tall');
    (state as Record<string, string>)[t.name] = t.value;
    updateName();
    onChange({ ...state });
  });
}
