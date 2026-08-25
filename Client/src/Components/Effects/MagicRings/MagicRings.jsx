import './MagicRings.css'

const MagicRings = ({
  progress = 0,
  speed = 1,
  ringCount = 3,
  glow = 0.5,
  pulse = 0.5,
}) => {
  const safeProgress = Math.max(
    0,
    Math.min(100, progress),
  )

  const rings = Array.from({
    length: ringCount,
  })

  return (
    <div
      className="magic-rings"
      style={{
        '--ring-progress': `${safeProgress}%`,
        '--ring-speed': `${speed}s`,
        '--ring-glow': glow,
        '--ring-pulse': pulse,
      }}
      aria-hidden="true"
    >
      {rings.map((_, index) => (
        <span
          className="magic-ring"
          key={index}
          style={{
            '--ring-index': index,
          }}
        />
      ))}
    </div>
  )
}

export default MagicRings
