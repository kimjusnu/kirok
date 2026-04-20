type FactorPoint = { id: string; label: string; percentile: number }

const SIZE = 320
const CENTER = SIZE / 2
const MAX_RADIUS = CENTER - 40

function pointAt(index: number, total: number, ratio: number): [number, number] {
  // Start at top (12 o'clock) and go clockwise.
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = ratio * MAX_RADIUS
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

export function FactorRadar({ factors }: { factors: FactorPoint[] }) {
  const total = factors.length
  if (total < 3) return null

  const ringRatios = [0.25, 0.5, 0.75, 1]
  const polygonPoints = factors
    .map((f, i) => pointAt(i, total, Math.max(0, Math.min(1, f.percentile / 100))))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[320px] mx-auto"
      role="img"
      aria-label="요인별 백분위 레이더 차트"
    >
      {/* Reference rings */}
      {ringRatios.map((ratio) => (
        <polygon
          key={ratio}
          points={Array.from({ length: total }, (_, i) => pointAt(i, total, ratio))
            .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
            .join(' ')}
          fill="none"
          stroke={ratio === 0.5 ? '#d1d5db' : '#e5e7eb'}
          strokeWidth={1}
          strokeDasharray={ratio === 1 ? '' : '2 3'}
        />
      ))}

      {/* Axes */}
      {factors.map((f, i) => {
        const [x, y] = pointAt(i, total, 1)
        return (
          <line
            key={f.id}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        )
      })}

      {/* Score polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(37,99,235,0.08)"
        stroke="#2563eb"
        strokeWidth={1.5}
      />

      {/* Vertex dots */}
      {factors.map((f, i) => {
        const ratio = Math.max(0, Math.min(1, f.percentile / 100))
        const [x, y] = pointAt(i, total, ratio)
        return (
          <circle key={`${f.id}-dot`} cx={x} cy={y} r={2.5} fill="#2563eb" />
        )
      })}

      {/* Labels */}
      {factors.map((f, i) => {
        const [lx, ly] = pointAt(i, total, 1.18)
        return (
          <text
            key={`${f.id}-label`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#52525b"
            fontSize={11}
            style={{ letterSpacing: '0.02em' }}
          >
            {f.label}
          </text>
        )
      })}
    </svg>
  )
}
