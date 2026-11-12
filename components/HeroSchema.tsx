/**
 * The signature schematic: five disciplines on a construction grid, joined by
 * orthogonal routes. Static markup; lib/motion/hero.ts animates the class hooks.
 */
const W = 420;
const H = 520;

const NODES = [
  { id: 'N-01', label: 'CODE', x: 80, y: 80 },
  { id: 'N-02', label: 'DATA', x: 300, y: 160 },
  { id: 'N-03', label: 'INFRA', x: 120, y: 280, accent: true },
  { id: 'N-04', label: 'DELIVERY', x: 320, y: 380 },
  { id: 'N-05', label: 'PEOPLE', x: 140, y: 460 },
];

// Orthogonal routes with 12px fillets, node to node, plus one return path.
const ROUTES = [
  'M85 80 H288 A12 12 0 0 1 300 92 V155',
  'M300 165 V208 A12 12 0 0 1 288 220 H132 A12 12 0 0 0 120 232 V275',
  'M120 285 V318 A12 12 0 0 0 132 330 H308 A12 12 0 0 1 320 342 V375',
  'M320 385 V408 A12 12 0 0 1 308 420 H152 A12 12 0 0 0 140 432 V455',
];
const RETURN = 'M135 460 H52 A12 12 0 0 1 40 448 V92 A12 12 0 0 1 52 80 H75';

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

export function HeroSchema() {
  return (
    <svg
      className="hero-schema"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* outer group: scroll parallax; inner group: load fade. Separate so the two never fight over opacity. */}
      <g className="schema-grid-wrap">
      <g className="schema-grid">
        {range(20, W - 20, 20).map((x) => (
          <line key={`vx${x}`} x1={x} y1={20} x2={x} y2={H - 20} className={x % 100 === 0 ? 'g-major' : 'g-minor'} />
        ))}
        {range(20, H - 20, 20).map((y) => (
          <line key={`hy${y}`} x1={20} y1={y} x2={W - 20} y2={y} className={y % 100 === 0 ? 'g-major' : 'g-minor'} />
        ))}
        {range(100, W - 100, 100).flatMap((x) =>
          range(100, H - 100, 100).map((y) => (
            <path key={`c${x}-${y}`} className="g-cross" d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`} />
          )),
        )}
        {/* measurement ticks: left and bottom edges */}
        {range(20, H - 20, 20).map((y) => (
          <line key={`tl${y}`} className="g-tick" x1={8} x2={y % 100 === 0 ? 18 : 13} y1={y} y2={y} />
        ))}
        {range(20, W - 20, 20).map((x) => (
          <line key={`tb${x}`} className="g-tick" y1={H - 8} y2={x % 100 === 0 ? H - 18 : H - 13} x1={x} x2={x} />
        ))}
        {/* dimension line across the top */}
        <path className="g-dim" d={`M20 8V16M20 12H140M280 12H${W - 20}M${W - 20} 8V16`} />
        <text className="schema-meta" x={W / 2} y={14.5} textAnchor="middle">SCHEMA · 420 × 520</text>
      </g>
      </g>

      <g className="schema-routes">
        {ROUTES.map((d, i) => (
          <path key={i} className="schema-route" d={d} pathLength={1} />
        ))}
        <path className="schema-route schema-route--return" d={RETURN} pathLength={1} />
      </g>

      <g className="schema-pulse" style={{ opacity: 0 }}>
        <circle r={9} className="schema-pulse__halo" />
        <circle r={3} className="schema-pulse__dot" />
      </g>

      <circle className="schema-ring" cx={120} cy={280} r={15} />

      {NODES.map((n) => (
        <g key={n.id} className={`schema-node${n.accent ? ' is-accent' : ''}`} data-x={n.x} data-y={n.y}>
          <rect className="schema-node__frame" x={n.x - 8} y={n.y - 8} width={16} height={16} />
          <rect className="schema-node__core" x={n.x - 4} y={n.y - 4} width={8} height={8} />
        </g>
      ))}

      {NODES.map((n) => (
        <g key={`l${n.id}`} className="schema-label">
          <text className="schema-label__name" x={n.x + 16} y={n.y - 2}>{n.label}</text>
          <text className="schema-label__meta" x={n.x + 16} y={n.y + 10}>{`${n.id} · ${n.x},${n.y}`}</text>
        </g>
      ))}

      <g className="schema-cursor" style={{ opacity: 0 }}>
        <line className="schema-cursor__h" x1={0} x2={W} y1={0} y2={0} />
        <line className="schema-cursor__v" x1={0} x2={0} y1={0} y2={H} />
        <text className="schema-cursor__label" x={6} y={-6} />
      </g>
    </svg>
  );
}
