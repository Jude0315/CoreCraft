import MagicRings from "../Effects/MagicRings/MagicRings";
import "./SynthesisCore.css";

export default function SynthesisCore({
  progress = 0,
  status = "idle",
  stage = "Ready",
}) {
  const isRunning =
    status === "generating";

  const isComplete =
    status === "complete";

  return (
    <div
      className={`synthesis-field synthesis-field--${status}`}
    >
      <div className="synthesis-reactor-shell">
        <div className="synthesis-reactor-inner">
          <MagicRings
            color="#46D9FF"
            colorTwo="#A9F3FF"
            ringCount={4}
            speed={
              isRunning
                ? 1.15 + progress / 130
                : 0.45
            }
            attenuation={8}
            lineThickness={2}
            baseRadius={0.17}
            radiusStep={0.16}
            scaleRate={
              isRunning
                ? 0.2
                : 0.1
            }
            opacity={0.95}
            blur={0}
            noiseAmount={0.08}
            rotation={0}
            ringGap={1.75}
            fadeIn={0.55}
            fadeOut={0.35}
            followMouse={false}
            mouseInfluence={0}
            hoverScale={1}
            parallax={0}
            clickBurst={false}
            progress={progress}
            glow={isRunning ? 0.85 : 0.55}
            pulse={isRunning ? 0.8 : 0.45}
          />
        </div>
      </div>

      <div className="synthesis-heart">
        <strong>
          {isComplete
            ? `COMPLETE ${progress}%`
            : `SYNTHESIZING ${progress}%`}
        </strong>

        <small>
          {stage}
        </small>
      </div>
    </div>
  );
}
