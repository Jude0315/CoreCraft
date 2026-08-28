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

  // Runs the visible generation pipeline one stage at a time.
  // This mirrors the backend flow: schemas, backend, frontend, then full project assembly.
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

      // First create Mongoose models from the saved specification.
      await generateSchemas(
        sessionId,
      );

      setProgress(32);

      setStage(
        "Synthesizing backend",
      );

      // Then generate controllers and routes for the selected API modules.
      await generateBackend(
        sessionId,
      );

      setProgress(56);

      setStage(
        "Building application interface",
      );

      // Then generate React pages and frontend API helpers.
      await generateFrontend(
        sessionId,
      );

      setProgress(78);

      setStage(
        "Assembling application",
      );

      // Finally write the complete downloadable MERN project structure.
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

  // Loads the current session and starts generation only when the blueprint is ready.
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

      // Prevents React's development re-rendering from starting duplicate generation runs.
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
            Review Generated Project
          </button>
        </div>
      )}
    </section>
  );
}
