import LaserFlow from "../Effects/LaserFlow/LaserFlow";
import "./CoreBackground.css";

export default function CoreBackground() {
  return (
    <div className="core-bg">

      <div className="core-bg__laser">
        <LaserFlow
          color="#46D9FF"
          horizontalBeamOffset={0.05}
          verticalBeamOffset={0}
          horizontalSizing={0.65}
          verticalSizing={2.2}
          wispDensity={1.1}
          wispSpeed={11}
          wispIntensity={4}
          flowSpeed={0.28}
          flowStrength={0.28}
          fogIntensity={0.45}
          fogScale={0.28}
          fogFallSpeed={0.4}
          decay={1.1}
          falloffStart={1.2}
        />
      </div>

      <div className="core-bg__grid" />

      <div className="core-bg__vignette" />

    </div>
  );
}
