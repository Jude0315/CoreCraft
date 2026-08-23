const GetUiSpecification = (
  specification = {}
) => {
  const ui =
    specification.ui || {};

  return {
    theme:
      ui.theme ||
      "modern",

    style:
      ui.style ||
      "professional",

    colors: {
      primary:
        ui.colors?.primary ||
        "#2563eb",

      primaryText:
        ui.colors?.primaryText ||
        "#ffffff",

      secondary:
        ui.colors?.secondary ||
        "#64748b",

      background:
        ui.colors?.background ||
        "#f8fafc",

      surface:
        ui.colors?.surface ||
        "#ffffff",

      surfaceText:
        ui.colors?.surfaceText ||
        "#0f172a",

      text:
        ui.colors?.text ||
        "#0f172a",

      mutedText:
        ui.colors?.mutedText ||
        "#64748b",

      border:
        ui.colors?.border ||
        "#e2e8f0",

      danger:
        ui.colors?.danger ||
        "#dc2626",

      success:
        ui.colors?.success ||
        "#16a34a",
    },

    spacing: {
      xs:
        ui.spacing?.xs ||
        "6px",

      sm:
        ui.spacing?.sm ||
        "10px",

      md:
        ui.spacing?.md ||
        "16px",

      lg:
        ui.spacing?.lg ||
        "24px",

      xl:
        ui.spacing?.xl ||
        "32px",
    },

    radius: {
      input:
        ui.radius?.input ||
        "10px",

      card:
        ui.radius?.card ||
        "12px",

      button:
        ui.radius?.button ||
        "10px",
    },

    layout: {
      navigation:
        ui.layout?.navigation ||
        "sidebar",

      sidebarWidth:
        ui.layout?.sidebarWidth ||
        "250px",

      headerHeight:
        ui.layout?.headerHeight ||
        "68px",

      pageMaxWidth:
        ui.layout?.pageMaxWidth ||
        "1400px",
    },

    auth: {
      formPosition:
        ui.auth?.formPosition ||
        "right",

      contentAlignment:
        ui.auth?.contentAlignment ||
        "center",

      background: {
        type:
          ui.auth?.background?.type ||
          "gradient",

        primary:
          ui.auth?.background?.primary ||
          ui.colors?.background ||
          "#f8fafc",

        secondary:
          ui.auth?.background?.secondary ||
          ui.colors?.primary ||
          "#2563eb",

        accent:
          ui.auth?.background?.accent ||
          ui.colors?.primary ||
          "#2563eb",

        direction:
          ui.auth?.background?.direction ||
          "135deg",
      },

      panel: {
        style:
          ui.auth?.panel?.style ||
          "solid",

        width:
          ui.auth?.panel?.width ||
          "420px",

        opacity:
          ui.auth?.panel?.opacity ??
          1,

        padding:
          ui.auth?.panel?.padding ||
          "32px",
      },

      branding: {
        show:
          ui.auth?.branding?.show ??
          true,

        position:
          ui.auth?.branding?.position ||
          "left",

        showDescription:
          ui.auth?.branding
            ?.showDescription ??
          true,

        alignment:
          ui.auth?.branding?.alignment ||
          "left",
      },

      decoration: {
        type:
          ui.auth?.decoration?.type ||
          "none",

        intensity:
          ui.auth?.decoration
            ?.intensity ||
          "subtle",
      },
    },

    cardShadow:
      ui.cardShadow ||
      "0 10px 30px rgba(15, 23, 42, 0.08)",

    fontStyle:
      ui.fontStyle ||
      "modern",

    headingWeight:
      ui.headingWeight ||
      700,

    bodyWeight:
      ui.bodyWeight ||
      400,

    cardStyle:
      ui.cardStyle ||
      "elevated",

    buttonStyle:
      ui.buttonStyle ||
      "rounded",

    tableStyle:
      ui.tableStyle ||
      "clean",

    formStyle:
      ui.formStyle ||
      "stacked",

    visualDensity:
      ui.visualDensity ||
      "comfortable",
  };
};


const GetFontFamily = (
  fontStyle
) => {
  const values = {
    modern:
      'Inter, Arial, sans-serif',

    classic:
      'Georgia, "Times New Roman", serif',

    technical:
      '"IBM Plex Sans", Arial, sans-serif',

    elegant:
      '"Segoe UI", Helvetica, Arial, sans-serif',
  };

  return (
    values[fontStyle] ||
    values.modern
  );
};


const GenerateDesignTokens = (
  specification = {}
) => {
  const ui =
    GetUiSpecification(
      specification
    );

  const fontFamily =
    GetFontFamily(
      ui.fontStyle
    );


  return `
/* CoreCraft design tokens.
   These values are generated from the application's UI specification. */
:root {
  --color-primary:
    ${ui.colors.primary};

  --color-primary-text:
    ${ui.colors.primaryText};

  --color-secondary:
    ${ui.colors.secondary};

  --color-background:
    ${ui.colors.background};

  --color-surface:
    ${ui.colors.surface};

  --color-surface-text:
    ${ui.colors.surfaceText};

  --color-text:
    ${ui.colors.text};

  --color-muted-text:
    ${ui.colors.mutedText};

  --color-border:
    ${ui.colors.border};

  --color-danger:
    ${ui.colors.danger};

  --color-success:
    ${ui.colors.success};


  --radius-input:
    ${ui.radius.input};

  --radius-card:
    ${ui.radius.card};

  --radius-button:
    ${ui.radius.button};


  --spacing-xs:
    ${ui.spacing.xs};

  --spacing-sm:
    ${ui.spacing.sm};

  --spacing-md:
    ${ui.spacing.md};

  --spacing-lg:
    ${ui.spacing.lg};

  --spacing-xl:
    ${ui.spacing.xl};


  --page-max-width:
    ${ui.layout.pageMaxWidth};

  --sidebar-width:
    ${ui.layout.sidebarWidth};

  --header-height:
    ${ui.layout.headerHeight};

  --auth-bg-primary:
    ${ui.auth.background.primary};

  --auth-bg-secondary:
    ${ui.auth.background.secondary};

  --auth-bg-accent:
    ${ui.auth.background.accent};

  --auth-bg-direction:
    ${ui.auth.background.direction};

  --auth-panel-width:
    ${ui.auth.panel.width};

  --auth-panel-opacity:
    ${ui.auth.panel.opacity};

  --auth-panel-padding:
    ${ui.auth.panel.padding};


  --font-family:
    ${fontFamily};

  --heading-weight:
    ${ui.headingWeight};

  --body-weight:
    ${ui.bodyWeight};


  --card-shadow:
    ${ui.cardShadow};
}
`;
};


const GetFormLayoutStyles = (
  formStyle
) => {
  switch (formStyle) {
    case "two-column":
      return `
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    var(--spacing-md);
`;

    case "compact":
      return `
  display: flex;

  flex-direction: column;

  gap:
    var(--spacing-sm);
`;

    case "stacked":
    default:
      return `
  display: flex;

  flex-direction: column;

  gap:
    var(--spacing-md);
`;
  }
};


const GetTableStyleRules = (
  tableStyle
) => {
  switch (tableStyle) {
    case "striped":
      return `
.data-table tbody tr:nth-child(even) {
  background:
    color-mix(
      in srgb,
      var(--color-background)
      70%,
      var(--color-surface)
    );
}
`;

    case "bordered":
      return `
.data-table {
  border:
    1px solid
    var(--color-border);
}

.data-table th,
.data-table td {
  border:
    1px solid
    var(--color-border);
}
`;

    case "minimal":
      return `
.data-table th,
.data-table td {
  border-bottom:
    0;
}

.data-table th {
  color:
    var(--color-muted-text);
}
`;

    case "clean":
    default:
      return `
.data-table th,
.data-table td {
  border-bottom:
    1px solid
    var(--color-border);
}
`;
  }
};


const GetCardStyleRules = (
  cardStyle
) => {
  switch (cardStyle) {
    case "flat":
      return `
.content-card,
.auth-card,
.stat-card {
  border:
    0;

  box-shadow:
    none;
}
`;

    case "bordered":
      return `
.content-card,
.auth-card,
.stat-card {
  border:
    1px solid
    var(--color-border);

  box-shadow:
    none;
}
`;

    case "elevated":
    default:
      return `
.content-card,
.auth-card,
.stat-card {
  border:
    1px solid
    var(--color-border);

  box-shadow:
    var(--card-shadow);
}
`;
  }
};


const GetButtonStyleRules = (
  buttonStyle
) => {
  switch (buttonStyle) {
    case "square":
      return `
.primary-button,
.secondary-button,
.nav-link {
  border-radius:
    2px;
}
`;

    case "soft":
      return `
.primary-button,
.secondary-button,
.nav-link {
  border-radius:
    6px;
}
`;

    case "pill":
      return `
.primary-button,
.secondary-button,
.nav-link {
  border-radius:
    999px;
}
`;

    case "rounded":
    default:
      return `
.primary-button,
.secondary-button,
.nav-link {
  border-radius:
    var(--radius-button);
}
`;
  }
};


const GenerateGlobalStyles = (
  specification = {}
) => {
  const ui =
    GetUiSpecification(
      specification
    );

  const formLayoutStyles =
    GetFormLayoutStyles(
      ui.formStyle
    );

  const tableStyleRules =
    GetTableStyleRules(
      ui.tableStyle
    );

  const cardStyleRules =
    GetCardStyleRules(
      ui.cardStyle
    );

  const buttonStyleRules =
    GetButtonStyleRules(
      ui.buttonStyle
    );

  const densityPadding =
    ui.visualDensity === "compact"
      ? "10px 12px"
      : ui.visualDensity ===
          "spacious"
        ? "16px 18px"
        : "12px 14px";

  return `
${GenerateDesignTokens(
  specification
)}

* {
  box-sizing:
    border-box;
}

html,
body,
#root {
  min-height:
    100%;
}

body {
  margin:
    0;

  font-family:
    var(--font-family);

  font-weight:
    var(--body-weight);

  background:
    var(--color-background);

  color:
    var(--color-text);
}

button,
input,
select,
textarea {
  font:
    inherit;
}

button {
  cursor:
    pointer;
}

.page-shell {
  width:
    min(
      calc(
        100% -
        calc(
          var(--spacing-lg) * 2
        )
      ),
      var(--page-max-width)
    );

  margin:
    0 auto;

  padding:
    var(--spacing-xl)
    0;
}

.page-header {
  margin-bottom:
    var(--spacing-lg);
}

.page-header h1 {
  margin:
    var(--spacing-xs)
    0
    var(--spacing-sm);

  font-weight:
    var(--heading-weight);

  font-size:
    clamp(
      1.8rem,
      3vw,
      2.5rem
    );
}

.page-header p {
  margin:
    0;

  color:
    var(--color-muted-text);
}

.eyebrow {
  display:
    inline-block;

  color:
    var(--color-primary);

  font-size:
    0.78rem;

  font-weight:
    700;

  text-transform:
    uppercase;

  letter-spacing:
    0.08em;
}

.content-card {
  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border-radius:
    var(--radius-card);

  padding:
    var(--spacing-lg);
}

${cardStyleRules}

.card-heading {
  margin-bottom:
    var(--spacing-md);
}

.card-heading h2 {
  margin:
    0;
}

/* Shared form controls used by generated CRUD pages. */
.entity-form {
  ${formLayoutStyles}
}

.form-group {
  display:
    flex;

  flex-direction:
    column;

  gap:
    var(--spacing-xs);
}

.form-group label {
  font-weight:
    600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width:
    100%;

  padding:
    ${densityPadding};

  border:
    1px solid
    var(--color-border);

  border-radius:
    var(--radius-input);

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  outline:
    none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color:
    var(--color-primary);

  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--color-primary)
      18%,
      transparent
    );
}

.form-group small {
  color:
    var(--color-muted-text);
}

.form-action-row {
  display:
    flex;

  gap:
    var(--spacing-sm);

  align-items:
    center;
}

.entity-form
.form-action-row {
  grid-column:
    1 / -1;
}

.primary-button,
.secondary-button {
  border:
    0;

  padding:
    ${densityPadding};

  font-weight:
    600;
}

${buttonStyleRules}

.primary-button {
  background:
    var(--color-primary);

  color:
    var(--color-primary-text);
}

.secondary-button {
  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border:
    1px solid
    var(--color-border);
}

.form-error,
.form-success {
  margin-bottom:
    var(--spacing-md);

  padding:
    var(--spacing-md);

  border-radius:
    var(--radius-card);

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border:
    1px solid
    var(--color-border);
}

.form-error {
  color:
    var(--color-danger);
}

.form-success {
  color:
    var(--color-success);
}

.data-table {
  width:
    100%;

  border-collapse:
    collapse;

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);
}

.data-table th,
.data-table td {
  padding:
    ${densityPadding};

  text-align:
    left;
}

.data-table th {
  color:
    var(--color-muted-text);

  font-size:
    0.8rem;

  text-transform:
    uppercase;

  letter-spacing:
    0.04em;
}

${tableStyleRules}

.dashboard-grid {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(
        200px,
        1fr
      )
    );

  gap:
    var(--spacing-md);
}

.stat-card {
  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border-radius:
    var(--radius-card);

  padding:
    var(--spacing-lg);
}

.stat-label {
  display:
    block;

  margin-bottom:
    var(--spacing-sm);

  color:
    var(--color-muted-text);

  font-size:
    0.85rem;
}

.stat-value {
  font-size:
    2rem;

  font-weight:
    var(--heading-weight);

  color:
    var(--color-surface-text);
}

/* Main application layout and navigation. */
.app-layout {
  min-height:
    100vh;

  background:
    var(--color-background);
}

.app-header {
  min-height:
    var(--header-height);

  display:
    flex;

  align-items:
    center;

  gap:
    var(--spacing-lg);

  padding:
    var(--spacing-sm)
    var(--spacing-lg);

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border-bottom:
    1px solid
    var(--color-border);
}

.brand-block {
  flex-shrink:
    0;
}

.brand-name {
  font-size:
    1.05rem;

  color:
    var(--color-surface-text);
}

.header-actions {
  display:
    flex;

  align-items:
    center;

  gap:
    var(--spacing-sm);

  margin-left:
    auto;
}

.user-role {
  color:
    var(--color-muted-text);

  font-size:
    0.85rem;

  text-transform:
    capitalize;
}

.app-body {
  display:
    flex;

  min-height:
    calc(
      100vh -
      var(--header-height)
    );
}

.app-sidebar {
  width:
    var(--sidebar-width);

  flex-shrink:
    0;

  padding:
    var(--spacing-md);

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border-right:
    1px solid
    var(--color-border);
}

.app-content {
  flex:
    1;

  min-width:
    0;
}

.side-navigation,
.top-navigation {
  display:
    flex;

  gap:
    var(--spacing-sm);
}

.side-navigation {
  flex-direction:
    column;
}

.top-navigation {
  align-items:
    center;

  flex:
    1;

  gap:
    var(--spacing-xs);

  min-width:
    0;

  overflow-x:
    auto;
}

.navigation-topbar .app-header {
  position:
    sticky;

  top:
    0;

  z-index:
    20;
}

.navigation-topbar .app-body {
  display:
    block;
}

.navigation-topbar .app-content {
  width:
    100%;
}

.navigation-topbar .nav-link {
  white-space:
    nowrap;
}

.nav-link {
  color:
    var(--color-muted-text);

  text-decoration:
    none;

  padding:
    ${densityPadding};

  font-weight:
    600;
}

.nav-link:hover,
.nav-link.active {
  color:
    var(--color-primary);

  background:
    color-mix(
      in srgb,
      var(--color-primary)
      10%,
      transparent
    );
}

/* Authentication page visuals generated from the AI auth specification. */
.auth-shell {
  min-height:
    100vh;

  display:
    grid;

  grid-template-columns:
    minmax(0, 1fr)
    minmax(420px, 520px);

  background:
    var(--auth-bg-primary);

  position:
    relative;

  overflow:
    hidden;
}

.auth-background-solid {
  background:
    var(--auth-bg-primary);
}

.auth-background-gradient {
  background:
    linear-gradient(
      var(--auth-bg-direction),
      var(--auth-bg-primary),
      var(--auth-bg-secondary)
    );
}

.auth-background-radial {
  background:
    radial-gradient(
      circle at top left,
      var(--auth-bg-accent),
      var(--auth-bg-secondary),
      var(--auth-bg-primary)
    );
}

.auth-background-mesh {
  background:
    radial-gradient(
      circle at 15% 20%,
      color-mix(
        in srgb,
        var(--auth-bg-accent)
        45%,
        transparent
      ),
      transparent 35%
    ),
    radial-gradient(
      circle at 85% 75%,
      color-mix(
        in srgb,
        var(--auth-bg-secondary)
        55%,
        transparent
      ),
      transparent 40%
    ),
    var(--auth-bg-primary);
}

.auth-background-pattern {
  background-color:
    var(--auth-bg-primary);

  background-image:
    linear-gradient(
      color-mix(
        in srgb,
        var(--auth-bg-accent)
        10%,
        transparent
      )
      1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      color-mix(
        in srgb,
        var(--auth-bg-accent)
        10%,
        transparent
      )
      1px,
      transparent 1px
    );

  background-size:
    32px 32px;
}

.auth-position-left {
  grid-template-columns:
    minmax(380px, 520px)
    minmax(0, 1fr);
}

.auth-position-right {
  grid-template-columns:
    minmax(0, 1fr)
    minmax(380px, 520px);
}

.auth-position-center {
  display:
    flex;

  justify-content:
    center;

  align-items:
    center;
}

.auth-align-start {
  align-items:
    flex-start;
}

.auth-align-center {
  align-items:
    center;
}

.auth-align-end {
  align-items:
    flex-end;
}

.auth-brand-right
.auth-brand {
  order:
    2;
}

.auth-brand-right
.auth-panel {
  order:
    1;
}

.auth-brand-top {
  display:
    flex;

  flex-direction:
    column;
}

.auth-brand-top
.auth-brand {
  min-height:
    auto;

  padding-bottom:
    0;
}

.auth-brand-top
.auth-panel {
  padding-top:
    var(--spacing-lg);
}

.auth-brand {
  display:
    flex;

  flex-direction:
    column;

  justify-content:
    center;

  text-align:
    left;

  padding:
    clamp(
      48px,
      8vw,
      120px
    );

  background:
    transparent;

  color:
    var(--color-primary-text);
}

.auth-brand-content {
  max-width:
    650px;
}

.auth-brand-align-center
.auth-brand,
.auth-brand-align-center
.auth-brand-content {
  text-align:
    center;
}

.auth-brand-align-right
.auth-brand,
.auth-brand-align-right
.auth-brand-content {
  text-align:
    right;
}

.auth-brand h1 {
  margin:
    0 0
    var(--spacing-md);

  max-width:
    650px;

  font-size:
    clamp(
      2.3rem,
      5vw,
      4.5rem
    );

  line-height:
    1.05;
}

.auth-brand p {
  margin:
    0;

  max-width:
    520px;

  font-size:
    1.05rem;

  line-height:
    1.7;

  opacity:
    0.85;
}

.auth-panel {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  padding:
    var(--spacing-xl);

  position:
    relative;

  z-index:
    1;
}

.auth-card {
  width:
    min(
      100%,
      var(--auth-panel-width)
    );

  max-width:
    var(--auth-panel-width);

  background:
    var(--color-surface);

  color:
    var(--color-surface-text);

  border-radius:
    var(--radius-card);

  padding:
    var(--auth-panel-padding);
}

.auth-panel-solid
.auth-card {
  background:
    var(--color-surface);
}

.auth-panel-glass
.auth-card {
  background:
    color-mix(
      in srgb,
      var(--color-surface)
      calc(
        var(--auth-panel-opacity)
        * 100%
      ),
      transparent
    );

  backdrop-filter:
    blur(18px);

  border:
    1px solid
    var(--color-border);
}

.auth-panel-bordered
.auth-card {
  background:
    var(--color-surface);

  border:
    1px solid
    var(--color-border);

  box-shadow:
    none;
}

.auth-panel-minimal
.auth-card {
  background:
    transparent;

  border:
    0;

  box-shadow:
    none;
}

.auth-decoration-glow::before {
  content:
    "";

  position:
    absolute;

  width:
    420px;

  height:
    420px;

  border-radius:
    50%;

  background:
    var(--auth-bg-accent);

  filter:
    blur(120px);

  opacity:
    0.25;

  top:
    -160px;

  left:
    -120px;

  pointer-events:
    none;
}

/* Responsive adjustments for smaller screens. */
@media (
  max-width: 768px
) {

  .page-shell {
    width:
      calc(
        100% -
        var(--spacing-lg)
      );
  }

  .entity-form {
    display:
      flex;

    flex-direction:
      column;
  }

  .form-action-row {
    flex-wrap:
      wrap;
  }

  .app-body {
    display:
      block;
  }

  .app-sidebar {
    width:
      100%;

    border-right:
      0;

    border-bottom:
      1px solid
      var(--color-border);
  }

  .side-navigation {
    flex-direction:
      row;

    overflow-x:
      auto;
  }

  .navigation-topbar
  .app-header {
    flex-wrap:
      wrap;
  }

  .navigation-topbar
  .top-navigation {
    order:
      3;

    width:
      100%;
  }

  .navigation-topbar
  .header-actions {
    margin-left:
      auto;
  }

  .auth-shell {
    grid-template-columns:
      1fr;
  }

  .auth-brand {
    padding:
      var(--spacing-xl)
      var(--spacing-lg);

    min-height:
      220px;
  }

  .auth-brand h1 {
    font-size:
      clamp(
        2rem,
        10vw,
        3rem
      );
  }

  .auth-panel {
    padding:
      var(--spacing-lg);
  }

  .auth-card {
    max-width:
      100%;
  }
}
`;
};


module.exports = {
  GetUiSpecification,
  GenerateDesignTokens,
  GenerateGlobalStyles,
};
