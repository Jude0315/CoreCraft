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
  acceptSuggestion,
  addBuilderMessage,
  createRequirementSession,
  finalizeRequirementSession,
  generateBuilderAiResponse,
  getRequirementSession,
  rejectSuggestion,
  removeFeature,
} from "../../Services/Api";

import "./RequirementsPage.css";

export default function RequirementsPage() {
  const {
    projectId,
  } = useParams();

  const navigate =
    useNavigate();

  const messagesEndRef =
    useRef(null);

  const [
    session,
    setSession,
  ] = useState(null);

  const [
    prompt,
    setPrompt,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    finalizing,
    setFinalizing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function refreshSession() {
    const data =
      await getRequirementSession(
        projectId,
      );

    if (data) {
      setSession(data);
    }

    return data;
  }

  async function initializeSession() {
    try {
      setLoading(true);
      setError("");

      let current =
        await getRequirementSession(
          projectId,
        );

      if (!current) {
        current =
          await createRequirementSession(
            projectId,
          );
      }

      setSession(current);
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initializeSession();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [session?.messages]);

  async function handleSend(
    event,
  ) {
    event.preventDefault();

    const content =
      prompt.trim();

    if (
      !content ||
      !session?._id ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");
      setPrompt("");

      await addBuilderMessage(
        session._id,
        "user",
        content,
      );

      await generateBuilderAiResponse(
        session._id,
      );

      await refreshSession();
    } catch (err) {
      console.error(
        "Requirement send failed:",
        err,
      );

      setPrompt(content);

      setError(
        err.message,
      );
    } finally {
      setSending(false);
    }
  }

  async function handleAcceptSuggestion(
    suggestion,
  ) {
    if (!session?._id) {
      return;
    }

    try {
      setError("");

      const updated =
        await acceptSuggestion(
          session._id,
          suggestion,
        );

      setSession(updated);
    } catch (err) {
      setError(
        err.message,
      );
    }
  }

  async function handleRejectSuggestion(
    suggestion,
  ) {
    if (!session?._id) {
      return;
    }

    try {
      setError("");

      const updated =
        await rejectSuggestion(
          session._id,
          suggestion,
        );

      setSession(updated);
    } catch (err) {
      setError(
        err.message,
      );
    }
  }

  async function handleRemoveFeature(
    feature,
  ) {
    if (!session?._id) {
      return;
    }

    try {
      setError("");

      await removeFeature(
        session._id,
        feature,
      );

      await refreshSession();
    } catch (err) {
      setError(
        err.message,
      );
    }
  }

  async function handleFinalize() {
    if (
      !session?._id ||
      finalizing
    ) {
      return;
    }

    try {
      setFinalizing(true);
      setError("");

      await finalizeRequirementSession(
        session._id,
      );

      await refreshSession();

      navigate(
        `/projects/${projectId}/specification`,
      );
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setFinalizing(false);
    }
  }

  function handlePromptKeyDown(
    event,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      event.currentTarget
        .form
        ?.requestSubmit();
    }
  }

  if (loading) {
    return (
      <div className="requirements-loading">
        <span className="requirements-loading-dot" />
        Initializing requirement engine
      </div>
    );
  }

  const selectedFeatures =
    session?.features || [];

  const suggestions =
    session?.suggestions || [];

  return (
    <section className="requirements-page">
      <div className="requirements-main">
        <header className="requirements-header">
          <div>
            <span>
              REQUIREMENT SYNTHESIS
            </span>

            <h1>
              Build with CoreCraft
            </h1>
          </div>

          {session?.appType && (
            <div className="requirements-app-type">
              <small>
                DETECTED TYPE
              </small>

              <strong>
                {session.appType}
              </strong>
            </div>
          )}
        </header>

        {error && (
          <div className="requirements-error">
            {error}
          </div>
        )}

        <div className="requirements-conversation">
          {!session?.messages?.length && (
            <div className="requirements-empty">
              <span>
                CORECRAFT READY
              </span>

              <h2>
                What do you want
                to build?
              </h2>

              <p>
                Describe the users,
                workflows, features and
                purpose of your
                application.
              </p>
            </div>
          )}

          {session?.messages?.map(
            (message, index) => (
              <div
                key={
                  message._id ||
                  index
                }
                className={
                  message.role === "user"
                    ? "requirement-message requirement-message--user"
                    : "requirement-message requirement-message--corecraft"
                }
              >
                <span>
                  {message.role === "user"
                    ? "YOU"
                    : "CORECRAFT"}
                </span>

                <p>
                  {message.content}
                </p>
              </div>
            ),
          )}

          {sending && (
            <div className="corecraft-thinking">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />

              <small>
                CoreCraft is
                analyzing...
              </small>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="requirements-prompt"
          onSubmit={handleSend}
        >
          <textarea
            value={prompt}
            onChange={
              (event) =>
                setPrompt(
                  event.target.value,
                )
            }
            onKeyDown={
              handlePromptKeyDown
            }
            placeholder="Describe your application, users, workflows and features..."
            rows={3}
            disabled={
              sending ||
              session?.finalized
            }
          />

          <button
            type="submit"
            disabled={
              sending ||
              !prompt.trim() ||
              session?.finalized
            }
          >
            {sending
              ? "..."
              : "↑"}
          </button>
        </form>
      </div>

      <aside className="requirements-intelligence">
        <section className="requirements-panel">
          <div className="requirements-panel-title">
            <span>
              AI SUGGESTIONS
            </span>

            <small>
              {suggestions.length}
            </small>
          </div>

          {!session?.appType ? (
            <p className="requirements-help">
              Start describing your
              application. Suggestions
              will appear after CoreCraft
              identifies the type of
              system.
            </p>
          ) : suggestions.length === 0 ? (
            <p className="requirements-help">
              No additional suggestions
              available.
            </p>
          ) : (
            <div className="requirements-suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="suggestion-row"
                >
                  <span>
                    {suggestion}
                  </span>

                  <div className="suggestion-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleAcceptSuggestion(
                          suggestion,
                        )
                      }
                    >
                      + Accept
                    </button>

                    <button
                      type="button"
                      className="reject"
                      onClick={() =>
                        handleRejectSuggestion(
                          suggestion,
                        )
                      }
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="requirements-panel">
          <div className="requirements-panel-title">
            <span>
              PROJECT FEATURES
            </span>

            <small>
              {selectedFeatures.length}
            </small>
          </div>

          {selectedFeatures.length === 0 ? (
            <p className="requirements-help">
              Accepted features will
              appear here.
            </p>
          ) : (
            <div className="selected-feature-list">
              {selectedFeatures.map((feature) => (
                <div
                  key={feature}
                  className="selected-feature"
                >
                  <span>
                    {feature}
                  </span>

                  {!session?.finalized && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFeature(
                          feature,
                        )
                      }
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="requirements-session-info">
          <div>
            <span>
              STATUS
            </span>

            <strong>
              {session?.finalized
                ? "Finalized"
                : "Draft"}
            </strong>
          </div>

          <div>
            <span>
              MESSAGES
            </span>

            <strong>
              {session?.messages
                ?.length || 0}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="requirements-finalize"
          onClick={
            handleFinalize
          }
          disabled={
            finalizing ||
            session?.finalized ||
            !session?.messages?.length
          }
        >
          {finalizing
            ? "Finalizing..."
            : session?.finalized
              ? "Requirements Finalized"
              : "Finalize Requirements ->"}
        </button>
      </aside>
    </section>
  );
}
