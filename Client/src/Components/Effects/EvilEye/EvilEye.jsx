import './EvilEye.css'

const EvilEye = ({
  intensity = 0.5,
  status = 'idle',
}) => {
  return (
    <div
      className={`evil-eye evil-eye-${status}`}
      style={{
        '--eye-intensity': intensity,
      }}
      aria-hidden="true"
    >
      <span className="evil-eye-orbit" />
      <span className="evil-eye-core" />
    </div>
  )
}

export default EvilEye
