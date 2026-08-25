import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addBuilderMessage,
  addFeature,
  createRequirementSession,
  finalizeSession,
  getRequirementSession,
  getSuggestions,
  removeFeature,
} from "../../Services/Api";

import "./BuilderPage.css";

export default function BuilderPage() {
  const {
    projectId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    session,
    setSession,
  ] = useState(null);

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

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
    error,
    setError,
  ] = useState("");

  const selectedFeatures =
    useMemo(
      () => session?.features || [],
      [session],
    );

  async function loadSuggestions(
    appType,
  ) {
    if (!appType) {
      setSuggestions([]);
      return;
    }

    try {
      const data =
        await getSuggestions(
          appType,
        );

      setSuggestions(
        Array.isArray(data)
          ? data
          : data?.suggestions || [],
      );
    } catch {
      setSuggestions([]);
    }
  }

  async function initializeBuilder() {
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

      setSession(
        current,
      );

      if (current?.appType) {
        await loadSuggestions(
          current.appType,
        );
      }
    } catch (err) {
      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initializeBuilder();
  }, [projectId]);

  async function refreshSession() {
    const refreshed =
      await getRequirementSession(
        projectId,
      );

    setSession(
      refreshed,
    );

    if (refreshed?.appType) {
      await loadSuggestions(
        refreshed.appType,
      );
    }
  }

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

      const updated =
        await addBuilderMessage(
          session._id,
          "user",
          content,
        );

      if (updated?._id) {
        setSession(
          updated,
        );

        if (updated.appType) {
          await loadSuggestions(
            updated.appType,
          );
        }
      } else {
        await refreshSession();
      }
    } catch (err) {
      setPrompt(content);

      setError(
        err.message,
      );
    } finally {
      setSending(false);
    }
  }

  async function handleAddFeature(
    feature,
  ) {
    if (!session?._id) {
      return;
    }

    try {
      setError("");

      const updated =
        await addFeature(
          session._id,
          feature,
        );

      if (updated?._id) {
        setSession(updated);
      } else {
        await refreshSession();
      }
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

      const updated =
        await removeFeature(
          session._id,
          feature,
        );

      if (updated?._id) {
        setSession(updated);
      } else {
        await refreshSession();
      }
    } catch (err) {
      setError(
        err.message,
      );
    }
  }

  async function handleFinalize() {
    if (!session?._id) {
      return;
    }

    try {
      setError("");

      await finalizeSession(
        session._id,
      );

      navigate(
        `/projects/${projectId}/specification`,
      );
    } catch (err) {
      setError(
        err.message,
      );
    }
  }

  if (loading) {
    return (
      <section className="builder-loading">
        Initializing CoreCraft...
      </section>
    );
  }

  return (
    <section className="builder-page">
      <header className="builder-header">
        <div>
          <span>
            REQUIREMENT SYNTHESIS
          </span>

          <h1>
            Define your application
          </h1>

          <p>
            Describe what you want to
            build. CoreCraft will
            structure your requirements
            as you continue.
          </p>
        </div>

        {session?.appType && (
          <div className="builder-detection">
            <small>
              DETECTED APPLICATION
            </small>

            <strong>
              {session.appType}
            </strong>
          </div>
        )}
      </header>

      {error && (
        <div className="builder-error">
          {error}
        </div>
      )}

      <div className="builder-workspace">
        <main className="builder-conversation">
          <div className="builder-messages">
            {!session?.messages?.length && (
              <div className="builder-welcome">
                <span>
                  CORECRAFT READY
                </span>

                <h2>
                  What do you want
                  to build?
                </h2>

                <p>
                  Describe the system,
                  users, features and
                  workflows naturally.
                </p>
              </div>
            )}

            {session?.messages?.map(
              (message, index) => (
                <article
                  key={
                    message._id ||
                    index
                  }
                  className={
                    message.role === "user"
                      ? "builder-message builder-message--user"
                      : "builder-message builder-message--assistant"
                  }
                >
                  <small>
                    {message.role === "user"
                      ? "YOU"
                      : "CORECRAFT"}
                  </small>

                  <p>
                    {message.content}
                  </p>
                </article>
              ),
            )}
          </div>

          <form
            className="builder-input"
            onSubmit={
              handleSend
            }
          >
            <textarea
              value={prompt}
              onChange={
                (event) =>
                  setPrompt(
                    event.target.value,
                  )
              }
              placeholder="Describe your application, users, workflows and features..."
              rows={3}
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !prompt.trim()
              }
            >
              {sending
                ? "Processing..."
                : "Send ↑"}
            </button>
          </form>
        </main>

        <aside className="builder-intelligence">
          <section className="builder-side-section">
            <div className="builder-side-heading">
              <span>
                AI SUGGESTIONS
              </span>

              <small>
                {suggestions.length}
              </small>
            </div>

            {!session?.appType ? (
              <p className="builder-side-empty">
                Describe your application
                first. Suggestions will
                appear once CoreCraft
                understands the project.
              </p>
            ) : suggestions.length === 0 ? (
              <p className="builder-side-empty">
                No additional suggestions.
              </p>
            ) : (
              <div className="builder-suggestions">
                {suggestions.map((feature) => {
                  const selected =
                    selectedFeatures.includes(
                      feature,
                    );

                  return (
                    <button
                      key={feature}
                      type="button"
                      className={
                        selected
                          ? "builder-suggestion builder-suggestion--selected"
                          : "builder-suggestion"
                      }
                      onClick={() =>
                        selected
                          ? handleRemoveFeature(
                              feature,
                            )
                          : handleAddFeature(
                              feature,
                            )
                      }
                    >
                      <span>
                        {selected
                          ? "✓"
                          : "+"}
                      </span>

                      {feature}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="builder-side-section">
            <div className="builder-side-heading">
              <span>
                SELECTED FEATURES
              </span>

              <small>
                {selectedFeatures.length}
              </small>
            </div>

            {selectedFeatures.length === 0 ? (
              <p className="builder-side-empty">
                No features selected yet.
              </p>
            ) : (
              <div className="builder-selected">
                {selectedFeatures.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() =>
                      handleRemoveFeature(
                        feature,
                      )
                    }
                  >
                    {feature}

                    <span>
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <button
            type="button"
            className="builder-finalize"
            onClick={
              handleFinalize
            }
            disabled={
              !session ||
              session.finalized
            }
          >
            {session?.finalized
              ? "Requirements Finalized"
              : "Finalize Requirements"}
          </button>
        </aside>
      </div>
    </section>
  );
}
