import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  generateSpecification,
  getRequirementSession,
} from "../../Services/Api";

import "./SpecificationPage.css";

export default function SpecificationPage() {
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
    specification,
    setSpecification,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    stage,
    setStage,
  ] = useState(
    "Loading finalized requirements...",
  );

  const [
    error,
    setError,
  ] = useState("");

  async function initializeSpecification() {
    try {
      setLoading(true);
      setError("");

      setStage(
        "Loading finalized requirements...",
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

      setSession(
        currentSession,
      );

      if (!currentSession.finalized) {
        throw new Error(
          "Requirements must be finalized before generating the application blueprint.",
        );
      }

      if (
        currentSession.specificationGeneratedAt
      ) {
        setStage(
          "Loading saved application blueprint...",
        );

        setSpecification(
          currentSession.generationSpecification,
        );

        return;
      }

      setStage(
        "Analyzing application architecture...",
      );

      const result =
        await generateSpecification(
          currentSession._id,
        );

      setStage(
        "Preparing application blueprint...",
      );

      setSpecification(
        result.specification,
      );

      if (result.session) {
        setSession(
          result.session,
        );
      }
    } catch (err) {
      console.error(
        "Specification error:",
        err,
      );

      setError(
        err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initializeSpecification();
  }, [projectId]);

  if (loading) {
    return (
      <section className="spec-loading">
        <div className="spec-loading-core">
          <div className="spec-loading-ring" />

          <div className="spec-loading-center">
            C
          </div>
        </div>

        <span>
          CORECRAFT ARCHITECT
        </span>

        <h2>
          Designing application
        </h2>

        <p>
          {stage}
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="spec-error">
        <span>
          BLUEPRINT ERROR
        </span>

        <h2>
          Specification could not
          be generated.
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={
            initializeSpecification
          }
        >
          Retry
        </button>
      </section>
    );
  }

  if (!specification) {
    return null;
  }

  const roles =
    specification.roles || [];

  const entities =
    specification.entities || [];

  const pages =
    specification.pages || [];

  const apiModules =
    specification.apiModules || [];

  const features =
    specification.features || [];

  return (
    <section className="spec-page">
      <header className="spec-header">
        <div>
          <span>
            APPLICATION BLUEPRINT
          </span>

          <h1>
            {specification.applicationName ||
              "Generated Application"}
          </h1>

          <p>
            {specification.description ||
              "CoreCraft generated application architecture."}
          </p>
        </div>

        <div className="spec-status">
          <span />
          Blueprint Ready
        </div>
      </header>

      <div className="spec-summary">
        <div>
          <strong>
            {roles.length}
          </strong>

          <span>
            Roles
          </span>
        </div>

        <div>
          <strong>
            {entities.length}
          </strong>

          <span>
            Entities
          </span>
        </div>

        <div>
          <strong>
            {pages.length}
          </strong>

          <span>
            Pages
          </span>
        </div>

        <div>
          <strong>
            {apiModules.length}
          </strong>

          <span>
            API Modules
          </span>
        </div>
      </div>

      <section className="spec-section">
        <div className="spec-section-heading">
          <span>
            01
          </span>

          <div>
            <small>
              APPLICATION
            </small>

            <h2>
              Architecture Overview
            </h2>
          </div>
        </div>

        <div className="spec-info-grid">
          <div>
            <small>
              TYPE
            </small>

            <strong>
              {specification.appType ||
                session?.appType ||
                "Custom Application"}
            </strong>
          </div>

          <div>
            <small>
              STACK
            </small>

            <strong>
              {specification.stack ||
                "MERN"}
            </strong>
          </div>

          <div>
            <small>
              STATUS
            </small>

            <strong>
              Ready for Synthesis
            </strong>
          </div>
        </div>
      </section>

      <section className="spec-section">
        <div className="spec-section-heading">
          <span>
            02
          </span>

          <div>
            <small>
              ACCESS MODEL
            </small>

            <h2>
              Roles
            </h2>
          </div>
        </div>

        {roles.length === 0 ? (
          <p className="spec-empty">
            No application roles
            are required.
          </p>
        ) : (
          <div className="spec-tags">
            {roles.map((role) => (
              <span key={role}>
                {role}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="spec-section">
        <div className="spec-section-heading">
          <span>
            03
          </span>

          <div>
            <small>
              DATA ARCHITECTURE
            </small>

            <h2>
              Entities
            </h2>
          </div>
        </div>

        <div className="spec-entities">
          {entities.map((entity) => (
            <article
              key={entity.name}
              className="spec-entity"
            >
              <div className="spec-entity-header">
                <div>
                  <h3>
                    {entity.name}
                  </h3>

                  {entity.description && (
                    <p>
                      {entity.description}
                    </p>
                  )}
                </div>

                <span>
                  {entity.fields?.length ||
                    0} fields
                </span>
              </div>

              <div className="spec-fields">
                {entity.fields?.map((field) => (
                  <div
                    key={field.name}
                    className="spec-field"
                  >
                    <div>
                      <strong>
                        {field.name}
                      </strong>

                      <span>
                        {field.type}
                      </span>
                    </div>

                    <div className="spec-field-meta">
                      {field.required && (
                        <span>
                          required
                        </span>
                      )}

                      {field.unique && (
                        <span>
                          unique
                        </span>
                      )}

                      {field.ref && (
                        <span>
                          Ref {field.ref}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="spec-section">
        <div className="spec-section-heading">
          <span>
            04
          </span>

          <div>
            <small>
              FRONTEND
            </small>

            <h2>
              Application Pages
            </h2>
          </div>
        </div>

        <div className="spec-list">
          {pages.map((page) => (
            <article
              key={`${page.name}-${page.route}`}
              className="spec-list-row"
            >
              <div>
                <strong>
                  {page.name}
                </strong>

                <small>
                  {page.route}
                </small>
              </div>

              <div className="spec-list-meta">
                <span>
                  {page.type}
                </span>

                {page.protected && (
                  <span>
                    Protected
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="spec-section">
        <div className="spec-section-heading">
          <span>
            05
          </span>

          <div>
            <small>
              BACKEND
            </small>

            <h2>
              API Modules
            </h2>
          </div>
        </div>

        <div className="spec-list">
          {apiModules.map((apiModule) => (
            <article
              key={apiModule.name}
              className="spec-list-row"
            >
              <div>
                <strong>
                  {apiModule.name}
                </strong>

                <small>
                  {apiModule.entity ||
                    "Application Module"}
                </small>
              </div>

              <div className="spec-operations">
                {apiModule.operations?.map((operation) => (
                  <span key={operation}>
                    {operation}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {features.length > 0 && (
        <section className="spec-section">
          <div className="spec-section-heading">
            <span>
              06
            </span>

            <div>
              <small>
                REQUIREMENTS
              </small>

              <h2>
                Selected Features
              </h2>
            </div>
          </div>

          <div className="spec-tags">
            {features.map((feature) => (
              <span key={feature}>
                {feature}
              </span>
            ))}
          </div>
        </section>
      )}

      <footer className="spec-actions">
        <button
          type="button"
          className="spec-back"
          onClick={() =>
            navigate(
              `/projects/${projectId}/requirements`,
            )
          }
        >
          Requirements
        </button>

        <button
          type="button"
          className="spec-generate"
          onClick={() =>
            navigate(
              `/projects/${projectId}/generate`,
            )
          }
        >
          Continue to Synthesis
        </button>
      </footer>
    </section>
  );
}
