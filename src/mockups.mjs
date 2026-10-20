// Ilustraciones SVG de pantallas (no son capturas reales). Colores de marca.
const N9 = '#0b1b33', N7 = '#1b3a66', P5 = '#f0526e', S2 = '#e3e8ee', S1 = '#f3f5f8', S3 = '#cfd6df', W = '#fff';

const frame = (inner, label) => `<svg class="mock" viewBox="0 0 640 400" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
<rect width="640" height="400" fill="${S1}"/>
<rect width="640" height="34" fill="${W}"/><circle cx="20" cy="17" r="5" fill="${P5}"/><circle cx="38" cy="17" r="5" fill="${S3}"/><circle cx="56" cy="17" r="5" fill="${S3}"/>
<rect x="150" y="9" width="340" height="16" rx="8" fill="${S1}"/>
${inner}</svg>`;

const side = (items = 5) => `<rect y="34" width="120" height="366" fill="${N9}"/><rect x="16" y="52" width="26" height="26" rx="7" fill="${W}"/><rect x="50" y="60" width="54" height="10" rx="5" fill="${S3}"/>` +
  Array.from({ length: items }, (_, i) => `<rect x="16" y="${104 + i * 38}" width="88" height="26" rx="8" fill="${i === 0 ? N7 : 'none'}"/><rect x="26" y="${113 + i * 38}" width="68" height="8" rx="4" fill="${i === 0 ? W : '#5d7396'}"/>`).join('');

function agenda(title) {
  const cols = [0, 1, 2, 3, 4].map((i) => `<rect x="${140 + i * 100}" y="86" width="92" height="296" rx="10" fill="${W}"/><rect x="${150 + i * 100}" y="98" width="40" height="8" rx="4" fill="${S3}"/>`).join('');
  const blocks = [[0, 120, 70, N7], [0, 230, 50, P5], [1, 150, 90, P5], [2, 110, 60, N7], [2, 200, 80, S3], [3, 140, 50, N7], [3, 220, 90, P5], [4, 120, 100, S3]]
    .map(([c, y, h, f]) => `<rect x="${146 + c * 100}" y="${y}" width="80" height="${h}" rx="8" fill="${f}" opacity="${f === S3 ? 1 : 0.92}"/><rect x="${154 + c * 100}" y="${y + 10}" width="46" height="7" rx="3.5" fill="${f === S3 ? '#9aa6b6' : W}"/>`).join('');
  return frame(`${side()}<rect x="140" y="50" width="130" height="14" rx="7" fill="${N9}"/><rect x="520" y="46" width="100" height="26" rx="13" fill="${P5}"/>${cols}${blocks}`, title);
}

function flow(title) {
  const node = (x, y, c, t) => `<rect x="${x}" y="${y}" width="120" height="64" rx="16" fill="${c}"/><rect x="${x + 22}" y="${y + 27}" width="76" height="9" rx="4.5" fill="${t}"/>`;
  const rows = [0, 1, 2, 3].map((i) => `<rect x="360" y="${250 + i * 34}" width="260" height="26" rx="8" fill="${W}"/><circle cx="378" cy="${263 + i * 34}" r="6" fill="${i % 2 ? N7 : P5}"/><rect x="394" y="${259 + i * 34}" width="130" height="8" rx="4" fill="${S3}"/><rect x="570" y="${259 + i * 34}" width="36" height="8" rx="4" fill="${S2}"/>`).join('');
  return frame(`${side(4)}
<path d="M200 130 H260 M380 130 H440 M320 162 V230" stroke="${S3}" stroke-width="4" stroke-linecap="round" fill="none"/>
${node(140, 98, N7, W)}${node(260, 98, P5, W)}${node(440, 98, N9, W)}
<rect x="260" y="230" width="120" height="64" rx="16" fill="${W}" stroke="${S3}" stroke-width="3"/><rect x="282" y="257" width="76" height="9" rx="4.5" fill="${N7}"/>
<rect x="140" y="250" width="200" height="26" rx="8" fill="${S2}"/><rect x="140" y="284" width="200" height="26" rx="8" fill="${S2}"/><rect x="140" y="318" width="200" height="26" rx="8" fill="${S2}"/>
<rect x="140" y="352" width="100" height="26" rx="13" fill="${P5}"/>${rows}`, title);
}

function shop(title) {
  const card = (x, y, c) => `<rect x="${x}" y="${y}" width="150" height="130" rx="12" fill="${W}"/><rect x="${x + 10}" y="${y + 10}" width="130" height="64" rx="8" fill="${c}"/><circle cx="${x + 75}" cy="${y + 42}" r="16" fill="${W}" opacity="0.35"/><rect x="${x + 10}" y="${y + 84}" width="90" height="8" rx="4" fill="${S3}"/><rect x="${x + 10}" y="${y + 102}" width="46" height="10" rx="5" fill="${N9}"/><rect x="${x + 98}" y="${y + 98}" width="42" height="20" rx="10" fill="${P5}"/>`;
  const cs = [N7, P5, S3, S3, N7, P5];
  return frame(`<rect y="34" width="640" height="52" fill="${N9}"/><rect x="24" y="48" width="26" height="26" rx="7" fill="${W}"/><rect x="62" y="56" width="70" height="10" rx="5" fill="${S3}"/><rect x="190" y="48" width="320" height="26" rx="13" fill="${N7}"/><circle cx="590" cy="61" r="13" fill="${P5}"/>
<rect x="24" y="102" width="92" height="24" rx="12" fill="${N7}"/><rect x="124" y="102" width="92" height="24" rx="12" fill="${S2}"/><rect x="224" y="102" width="92" height="24" rx="12" fill="${S2}"/>
${[0, 1, 2].map((i) => card(24 + i * 204, 142, cs[i])).join('')}${[0, 1, 2].map((i) => card(24 + i * 204, 280 - 8, cs[i + 3])).join('')}`, title);
}

function clients(title) {
  const row = (y, w, c) => `<rect x="140" y="${y}" width="320" height="46" rx="12" fill="${W}"/><circle cx="166" cy="${y + 23}" r="14" fill="${c}"/><rect x="192" y="${y + 12}" width="110" height="9" rx="4.5" fill="${N9}" opacity="0.8"/><rect x="192" y="${y + 28}" width="70" height="7" rx="3.5" fill="${S3}"/><rect x="330" y="${y + 20}" width="110" height="8" rx="4" fill="${S2}"/><rect x="330" y="${y + 20}" width="${w}" height="8" rx="4" fill="${c}"/>`;
  return frame(`${side()}<rect x="140" y="50" width="130" height="14" rx="7" fill="${N9}"/>
${[0, 1, 2, 3, 4, 5].map((i) => row(84 + i * 52, [80, 40, 100, 60, 25, 90][i], [P5, N7, P5, N7, P5, N7][i])).join('')}
<rect x="480" y="84" width="140" height="90" rx="14" fill="${N7}"/><rect x="496" y="102" width="60" height="8" rx="4" fill="${S3}"/><rect x="496" y="126" width="90" height="22" rx="6" fill="${W}"/>
<rect x="480" y="188" width="140" height="90" rx="14" fill="${P5}"/><rect x="496" y="206" width="60" height="8" rx="4" fill="${W}" opacity="0.7"/><rect x="496" y="230" width="70" height="22" rx="6" fill="${W}"/>
<rect x="480" y="292" width="140" height="90" rx="14" fill="${W}"/><rect x="496" y="310" width="60" height="8" rx="4" fill="${S3}"/><rect x="496" y="334" width="80" height="22" rx="6" fill="${N9}"/>`, title);
}

function stats(title) {
  const bars = [90, 140, 110, 170, 130, 200, 160].map((h, i) => `<rect x="${170 + i * 56}" y="${350 - h}" width="34" height="${h}" rx="8" fill="${i % 2 ? P5 : N7}"/>`).join('');
  const kpi = (x, c) => `<rect x="${x}" y="60" width="150" height="70" rx="14" fill="${W}"/><rect x="${x + 16}" y="78" width="60" height="8" rx="4" fill="${S3}"/><rect x="${x + 16}" y="98" width="90" height="18" rx="6" fill="${c}"/>`;
  return frame(`${side()}${kpi(140, N7)}${kpi(306, P5)}${kpi(472, N9)}<rect x="140" y="146" width="480" height="236" rx="14" fill="${W}"/><path d="M160 350H600" stroke="${S2}" stroke-width="2"/>${bars}`, title);
}

function mobile(title) {
  const row = (y, c) => `<rect x="20" y="${y}" width="${280 - 40}" height="48" rx="12" fill="${W}"/><circle cx="46" cy="${y + 24}" r="12" fill="${c}"/><rect x="68" y="${y + 14}" width="100" height="8" rx="4" fill="${N9}" opacity="0.8"/><rect x="68" y="${y + 29}" width="64" height="7" rx="3.5" fill="${S3}"/>`;
  return `<svg class="mock" viewBox="0 0 640 400" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="400" fill="${N9}"/><rect x="170" y="-10" width="300" height="420" rx="36" fill="${S1}" stroke="${S3}" stroke-width="6"/>
<g transform="translate(170 0)"><rect x="0" y="0" width="300" height="86" fill="${N7}"/><rect x="20" y="40" width="120" height="12" rx="6" fill="${W}"/><rect x="20" y="60" width="70" height="8" rx="4" fill="${S3}"/><circle cx="262" cy="52" r="14" fill="${P5}"/>
${[0, 1, 2, 3, 4].map((i) => row(104 + i * 58, i % 2 ? N7 : P5)).join('')}</g></svg>`;
}

const byType = { agenda, flow, shop, clients };
export function mockup(type, title) {
  const fn = byType[type];
  if (!fn) throw new Error(`Ilustración inexistente: ${type}`);
  return fn(title);
}
export const mockStats = stats;
export const mockMobile = mobile;
export const mockTypes = Object.keys(byType);
