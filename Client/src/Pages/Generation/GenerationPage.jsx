import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  generateBackend,
  generateFrontend,
  generateFullProject,
  generateSchemas,
  getProjectById,
  getRequirementSession,
} from "../../Services/Api";

import SynthesisCore from "../../Components/SynthesisCore/SynthesisCore";
import "./GenerationPage.css";

export default function GenerationPage() {
  const {
    projectId,
  } = useParams();

  const navigate =
    useNavigate();

  const startedRef =
    useRef(false);

  const [
    session,
    setSession,
  ] = useState(null);

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    stage,
    setStage,
  ] = useState(
    "Preparing synthesis",
  );

  const [
    status,
    setStatus,
  ] = useState("idle");

  const [
    error,
    setError,
  ] = useState("");

  const [
    complete,
    setComplete,
  ] = useState(false);

  async function runSynthesis(
    sessionId,
  ) {
    try {
      setError("");
      setComplete(false);

      setStatus(
        "generating",
      );

      setProgress(12);

      setStage(
        "Creating database architecture",
      );

      await generateSchemas(
        sessionId,
      );

      setProgress(32);

      setStage(
        "Synthesizing backend",
      );

      await generateBackend(
        sessionId,
      );

      setProgress(56);

      setStage(
        "Building application interface",
      );

      await generateFrontend(
        sessionId,
      );

      setProgress(78);

      setStage(
        "Assembling application",
      );

      await generateFullProject(
        sessionId,
      );

      setProgress(100);

      setStage(
        "Application ready",
      );

      setStatus(
        "complete",
      );

      setComplete(true);

    } catch (err) {
      console.error(
        "Application synthesis failed:",
        err,
      );

      setStatus(
        "error",
      );

      setStage(
        "Synthesis interrupted",
      );

      setError(
        err.message,
      );
    }
  }

  async function initializeGeneration() {
    try {
      setError("");

      setStage(
        "Loading application blueprint",
      );

      const currentSession =
        await getRequirementSession(
          projectId,
        );

      if (!currentSession) {
        throw new Error(
          "Requirement session not found",
        );
      }

      if (!currentSession.finalized) {
        throw new Error(
          "Requirements must be finalized before synthesis.",
        );
      }

      if (
        !currentSession
          .specificationGeneratedAt
      ) {
        throw new Error(
          "Generate the application blueprint before synthesis.",
        );
      }

      setSession(
        currentSession,
      );

      const project =
        await getProjectById(
          projectId,
        );

      if (
        project?.status ===
        "generated"
      ) {
        setProgress(100);

        setStage(
          "Application ready",
        );

        setStatus(
          "complete",
        );

        setComplete(true);

        return;
      }

      if (
        startedRef.current
      ) {
        return;
      }

      startedRef.current =
        true;

      await runSynthesis(
        currentSession._id,
      );
    } catch (err) {
      console.error(
        "Generation initialization failed:",
        err,
      );

      setError(
        err.message,
      );

      setStatus(
        "error",
      );

      setStage(
        "Unable to initialize synthesis",
      );
    }
  }

  useEffect(() => {
    initializeGeneration();
  }, [projectId]);

  function retrySynthesis() {
    if (!session?._id) {
      return;
    }

    startedRef.current =
      true;

    setProgress(0);

    runSynthesis(
      session._id,
    );
  }

  return (
    <section className="generation-screen">
      <SynthesisCore
        progress={progress}
        status={status}
        stage={stage}
      />

      {error && (
        <div className="generation-error-state">
          <span>
            SYNTHESIS ERROR
          </span>

          <p>
            {error}
          </p>

          {session?._id && (
            <button
              type="button"
              onClick={
                retrySynthesis
              }
            >
              Retry Synthesis
            </button>
          )}
        </div>
      )}

      {complete && !error && (
        <div className="generation-complete-actions">
          <span>
            MERN APPLICATION GENERATED
          </span>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${projectId}/export`,
              )
            }
          >
            Review Generated Project -&gt;
          </button>
        </div>
      )}
    </section>
  );
}
