/* =========================================================
   CoreCraft Dynamic Frontend Generator

   Generates React pages directly from the AI specification.

   No LMS-specific pages.
   No Course / Quiz / Assignment special cases.
   No hardcoded application domains.
   ========================================================= */


/* =========================================================
   Normalize React Component Name

   "Maintenance Jobs"
   ->
   "MaintenanceJobs"
   ========================================================= */

const NormalizeComponentName = (
  pageName = ""
) => {
  return pageName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join("");
};


/* =========================================================
   Normalize Entity Name
   ========================================================= */

const NormalizeEntityName = (
  name = ""
) => {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
};


/* =========================================================
   Find Entity Definition
   ========================================================= */

const FindEntity = (
  entityName,
  entities = []
) => {
  return entities.find(
    (entity) =>
      NormalizeEntityName(
        entity?.name || ""
      ) ===
      NormalizeEntityName(
        entityName || ""
      )
  );
};


const GetReferenceFields = (entity) => {
  return (
    entity?.fields || []
  ).filter(
    (field) =>
      field.type === "ObjectId" &&
      field.ref
  );
};


const LowerFirst = (value = "") => {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toLowerCase() +
    value.slice(1)
  );
};


const GetAvailableEntityNames = (
  specification
) => {
  const names =
    (specification.entities || []).map(
      (entity) =>
        NormalizeEntityName(
          entity.name
        )
    );

  names.push("User");

  return new Set(
    names
  );
};


const GetReferenceOptionVariable = (
  field
) => {
  return `${LowerFirst(
    NormalizeEntityName(
      field.name
    )
  )}Options`;
};


const BuildLookupPath = (
  entityName,
  fieldName
) => {
  const source =
    LowerFirst(
      NormalizeEntityName(
        entityName
      )
    );

  const field =
    LowerFirst(
      NormalizeEntityName(
        fieldName
      )
    );

  return (
    `/lookups/${source}/${field}`
  );
};


/* =========================================================
   Generate All Frontend Pages
   ========================================================= */

const GenerateFrontendFiles = (
  specification
) => {
  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const pages =
    Array.isArray(
      specification.pages
    )
      ? specification.pages
      : [];

  const entities =
    Array.isArray(
      specification.entities
    )
      ? specification.entities
      : [];

  const applicationName =
    specification.applicationName ||
    specification.appType ||
    "Generated Application";

  const pageFiles =
    pages.map((page) => {
      const pageName =
        typeof page === "string"
          ? page
          : page?.name || "Page";

      const componentName =
        NormalizeComponentName(
          pageName
        );

      const entity =
        FindEntity(
          page?.entity,
          entities
        );

      return {
        type: "page",

        page: pageName,

        filename:
          `${componentName}.jsx`,

        componentName,

        content:
          GeneratePageComponent(
            componentName,
            page,
            entity,
            applicationName,
            specification
          ),
      };
    });

  return {
    pageFiles,
  };
};


/* =========================================================
   Generate Generic Page
   ========================================================= */

const GeneratePageComponent = (
  componentName,
  page,
  entity,
  applicationName,
  specification = {}
) => {
  const displayName =
    page?.name ||
    componentName;

  const entityName =
    entity?.name ||
    page?.entity ||
    "";

  const fields =
    Array.isArray(
      entity?.fields
    )
      ? entity.fields
      : [];

  const actions =
    Array.isArray(
      page?.actions
    )
      ? page.actions.map(
          (action) =>
            action.toLowerCase()
        )
      : [];

  const description =
    page?.description ||
    `Manage ${displayName.toLowerCase()} in ${applicationName}.`;

  const apiName =
    entityName
      ? `${NormalizeEntityName(
          entityName
        )}Api`
      : "";

  const availableEntityNames =
    GetAvailableEntityNames(
      specification
    );

  const referenceFields =
    GetReferenceFields(entity)
      .filter((field) =>
        availableEntityNames.has(
          NormalizeEntityName(
            field.ref
          )
        )
      );

  const apiImports = [
    `${NormalizeEntityName(
      entityName
    )}Api`,
  ];

  const uniqueApiImports = [
    ...new Set(apiImports),
  ];

  const apiImportStatement = `
import ${
  referenceFields.length > 0
    ? "API, "
    : ""
}{
  ${uniqueApiImports.join(",\n  ")}
} from "../Services/Api";`;

  const canView =
    actions.includes("view") ||
    page?.type === "list" ||
    page?.type === "crud";

  const canCreate =
    actions.includes("create");

  const canEdit =
    actions.includes("edit") ||
    actions.includes("update");

  const canDelete =
    actions.includes("delete");


  /* -------------------------------------------------------
     If page does not represent an entity,
     generate simple informational page.
     ------------------------------------------------------- */

  if (!entityName) {
    return GenerateSimplePage(
      componentName,
      displayName,
      description,
      applicationName
    );
  }


  /* -------------------------------------------------------
     Generate form state from entity fields
     ------------------------------------------------------- */

  const initialFormFields =
    fields
      .filter(
        (field) =>
          field.name !== "_id"
      )
      .map((field) => {
        let defaultValue = "";

        if (
          field.type === "Boolean"
        ) {
          defaultValue =
            field.defaultValue ??
            false;
        } else if (
          field.type === "Number"
        ) {
          defaultValue =
            field.defaultValue ??
            "";
        } else {
          defaultValue =
            field.defaultValue ??
            "";
        }

        return `    ${field.name}: ${JSON.stringify(
          defaultValue
        )}`;
      })
      .join(",\n");


  /* -------------------------------------------------------
     Generate form input fields
     ------------------------------------------------------- */

  const formFields =
    fields
      .filter(
        (field) =>
          field.name !== "_id"
      )
      .map((field) =>
        GenerateFormField(
          field,
          referenceFields
        )
      )
      .join("\n");

  const referenceState =
    referenceFields
      .map((field) => {
        const fieldName =
          NormalizeEntityName(
            field.name
          );

        const variableName =
          LowerFirst(
            fieldName
          );

        return `
  const [
    ${variableName}Options,
    set${fieldName}Options
  ] = useState([]);`;
      })
      .join("\n");

  const referenceLoaders =
    referenceFields
      .map((field) => {
        const normalizedField =
          NormalizeEntityName(
            field.name
          );

        const lookupPath =
          BuildLookupPath(
            entityName,
            field.name
        );

        return `
    try {
      const response =
        await API.get(
          "${lookupPath}"
        );

      const items =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      set${normalizedField}Options(
        items
      );
    } catch (error) {
      console.error(
        "Failed to load ${field.name} lookup:",
        error
      );
    }`;
      })
      .join("\n");

  const referenceDataLoader =
    referenceFields.length > 0
      ? `

  const LoadReferenceData = async () => {
${referenceLoaders}
  };
`
      : "";

  const referenceDataCall =
    referenceFields.length > 0
      ? `    LoadReferenceData();`
      : "";


  /* -------------------------------------------------------
     Generate table headings
     ------------------------------------------------------- */

  const tableHeaders =
    fields
      .slice(0, 5)
      .map(
        (field) =>
          `              <th>${FormatLabel(
            field.name
          )}</th>`
      )
      .join("\n");


  /* -------------------------------------------------------
     Generate table cells
     ------------------------------------------------------- */

  const tableCells =
    fields
      .slice(0, 5)
      .map(
        (field) =>
          `                <td>
                  {FormatValue(
                    item.${field.name}
                  )}
                </td>`
      )
      .join("\n");

  const listState =
    canView
      ? `
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);
`
      : "";

  const editingState =
    canEdit
      ? `
  const [editingId, setEditingId] =
    useState(null);
`
      : "";

  const resetEditingCode =
    canEdit
      ? `    setEditingId(null);`
      : "";

  const loadItemsCode =
    canView
      ? `

  /* -------------------------------------------------------
     Load records
     ------------------------------------------------------- */

  const LoadItems = async () => {
    try {
      setLoading(true);

      const response =
        await ${apiName}.getAll();

      setItems(
        response.data.data || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load ${displayName}"
      );
    } finally {
      setLoading(false);
    }
  };
`
      : "";

  const loadItemsCall =
    canView
      ? `    LoadItems();`
      : "";

  const reloadItemsCode =
    canView
      ? `      await LoadItems();`
      : "";

  let submitActionCode = "";

  if (
    canEdit &&
    canCreate
  ) {
    submitActionCode = `
      if (editingId) {
        await ${apiName}.update(
          editingId,
          payload
        );

        setSuccess(
          "${entityName} updated successfully"
        );
      } else {
        await ${apiName}.create(
          payload
        );

        setSuccess(
          "${entityName} created successfully"
        );
      }`;
  } else if (canEdit) {
    submitActionCode = `
      if (editingId) {
        await ${apiName}.update(
          editingId,
          payload
        );

        setSuccess(
          "${entityName} updated successfully"
        );
      }`;
  } else if (canCreate) {
    submitActionCode = `
      await ${apiName}.create(
        payload
      );

      setSuccess(
        "${entityName} created successfully"
      );`;
  }

  const editFormMapping =
    fields
      .filter(
        (field) =>
          field.name !== "_id"
      )
      .map(
        (field) =>
          `      ${field.name}:
        item.${field.name}?._id ||
        item.${field.name} ||
        "",`
      )
      .join("\n");

  const editHandlerCode =
    canEdit
      ? `

  /* -------------------------------------------------------
     Edit
     ------------------------------------------------------- */

  const HandleEdit = (
    item
  ) => {
    setEditingId(
      item._id
    );

    setForm({
${editFormMapping}
    });

    setError("");
    setSuccess("");
  };
`
      : "";

  const deleteHandlerCode =
    canDelete
      ? `

  /* -------------------------------------------------------
     Delete
     ------------------------------------------------------- */

  const HandleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this ${entityName}?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await ${apiName}.remove(
        id
      );

      setSuccess(
        "${entityName} deleted successfully"
      );

${reloadItemsCode}
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to delete ${entityName}"
      );
    }
  };
`
      : "";

  const formatValueCode =
    canView
      ? `

  /* -------------------------------------------------------
     Display helper
     ------------------------------------------------------- */

  const FormatValue = (
    value
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (
      typeof value === "object"
    ) {
      return (
        value.label ||
        value.name ||
        value.title ||
        value._id ||
        JSON.stringify(value)
      );
    }

    if (
      typeof value === "boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    return String(value);
  };
`
      : "";

  const formSupportCode =
    canCreate || canEdit
      ? `

  /* -------------------------------------------------------
     Reset form
     ------------------------------------------------------- */

  const ResetForm = () => {
    setForm({
${initialFormFields}
    });

${resetEditingCode}
  };


  /* -------------------------------------------------------
     Clean payload before saving
     ------------------------------------------------------- */

  const BuildPayload = () => {
    const payload = {
      ...form,
    };

    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    });

    return payload;
  };


  /* -------------------------------------------------------
     Create / Update
     ------------------------------------------------------- */

  const HandleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const payload =
        BuildPayload();

${submitActionCode}

      ResetForm();

${reloadItemsCode}
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to save ${entityName}"
      );
    }
  };
`
      : "";

  const formTitle =
    canEdit
      ? `{editingId
              ? "Edit ${entityName}"
              : "Create ${entityName}"}`
      : `Create ${entityName}`;

  const submitButtonText =
    canEdit
      ? `{editingId
                ? "Update ${entityName}"
                : "Create ${entityName}"}`
      : `Create ${entityName}`;

  const cancelButton =
    canEdit
      ? `

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={ResetForm}
              >
                Cancel
              </button>
            )}
`
      : "";


  /* -------------------------------------------------------
     Create imports
     ------------------------------------------------------- */

  return `import React, {
  useEffect,
  useState,
} from "react";

${apiImportStatement}


const ${componentName} = () => {
  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

${listState}

${editingState}

  const [form, setForm] =
    useState({
${initialFormFields}
    });

${referenceState}

${loadItemsCode}

${referenceDataLoader}


  useEffect(() => {
${loadItemsCall}
${referenceDataCall}
  }, []);


  /* -------------------------------------------------------
     Input change handler
     ------------------------------------------------------- */

  const HandleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm({
      ...form,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };


${formSupportCode}

${editHandlerCode}

${deleteHandlerCode}

${formatValueCode}


  return (
    <main className="page-shell">

      <section className="page-header">

        <span className="eyebrow">
          ${applicationName}
        </span>

        <h1>
          ${displayName}
        </h1>

        <p>
          ${EscapeText(
            description
          )}
        </p>

      </section>


      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      {success && (
        <div className="form-success">
          {success}
        </div>
      )}


${
  canCreate || canEdit
    ? `
      <section className="content-card">

        <div className="card-heading">
          <h2>
            ${formTitle}
          </h2>
        </div>


        <form
          className="entity-form"
          onSubmit={HandleSubmit}
        >

${formFields}

          <div className="form-action-row">

            <button
              className="primary-button action-button"
              type="submit"
            >
              ${submitButtonText}
            </button>

${cancelButton}

          </div>

        </form>

      </section>
`
    : ""
}


${
  canView
    ? `
      <section className="content-card module-section">

        <div className="card-heading">

          <h2>
            ${displayName}
          </h2>

        </div>


        {loading ? (

          <p>
            Loading...
          </p>

        ) : items.length === 0 ? (

          <p>
            No records found.
          </p>

        ) : (

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>

${tableHeaders}

${
  canEdit || canDelete
    ? `                  <th>
                    Actions
                  </th>`
    : ""
}

                </tr>

              </thead>


              <tbody>

                {items.map(
                  (item) => (

                    <tr
                      key={item._id}
                    >

${tableCells}

${
  canEdit || canDelete
    ? `                      <td>

                        <div className="row-actions">

${
  canEdit
    ? `                          <button
                            className="secondary-button"
                            onClick={() =>
                              HandleEdit(item)
                            }
                          >
                            Edit
                          </button>`
    : ""
}

${
  canDelete
    ? `                          <button
                            className="danger-button"
                            onClick={() =>
                              HandleDelete(
                                item._id
                              )
                            }
                          >
                            Delete
                          </button>`
    : ""
}

                        </div>

                      </td>`
    : ""
}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>
`
    : ""
}

    </main>
  );
};


export default ${componentName};
`;
};


/* =========================================================
   Generate Form Field
   ========================================================= */

const GenerateFormField = (
  field,
  referenceFields = []
) => {
  const fieldName =
    field.name;

  const label =
    FormatLabel(
      fieldName
    );

  const required =
    field.required
      ? "required"
      : "";

  const description =
    field.description || "";


  /* -------------------------------------------------------
     Boolean
     ------------------------------------------------------- */

  if (
    field.type === "Boolean"
  ) {
    return `
          <div className="form-group">

            <label className="checkbox-row">

              <input
                type="checkbox"
            name="${fieldName}"
            checked={
              Boolean(
                    form.${fieldName}
                  )
                }
                onChange={
                  HandleChange
                }
              />

              ${label}

            </label>

          </div>
`;
  }


  /* -------------------------------------------------------
     Enum
     ------------------------------------------------------- */

  if (
    Array.isArray(
      field.enumValues
    ) &&
    field.enumValues.length > 0
  ) {
    return `
          <div className="form-group">

            <label htmlFor="${fieldName}">
              ${label}
            </label>

            <select
              id="${fieldName}"
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              ${required}
            >

              <option value="">
                Select ${label}
              </option>

${field.enumValues
  .map(
    (value) =>
      `              <option value="${value}">
                ${value}
              </option>`
  )
  .join("\n")}

            </select>

${
  description
    ? `            <small>
              ${EscapeText(
                description
              )}
            </small>`
    : ""
}

          </div>
`;
  }


  /* -------------------------------------------------------
     Date
     ------------------------------------------------------- */

  if (
    field.type === "Date"
  ) {
    return `
          <div className="form-group">

            <label htmlFor="${fieldName}">
              ${label}
            </label>

            <input
              id="${fieldName}"
              type="datetime-local"
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              ${required}
            />

          </div>
`;
  }


  /* -------------------------------------------------------
     Number
     ------------------------------------------------------- */

  if (
    field.type === "Number"
  ) {
    return `
          <div className="form-group">

            <label>
              ${label}
            </label>

            <input
              type="number"
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              ${required}
            />

          </div>
`;
  }


  /* -------------------------------------------------------
     ObjectId relation
     ------------------------------------------------------- */

  if (
    field.type === "ObjectId" &&
    field.ref &&
    referenceFields.some(
      (referenceField) =>
        referenceField.name === field.name &&
        referenceField.ref === field.ref
    )
  ) {
    const variableName =
      LowerFirst(
        NormalizeEntityName(
          field.name
        )
      );

    return `
          <div className="form-group">

            <label htmlFor="${fieldName}">
              ${label}
            </label>

            <select
              id="${fieldName}"
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              ${required}
            >

              <option value="">
                Select ${FormatLabel(
                  field.name
                )}
              </option>

              {${variableName}Options.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    >
                    {item.label}
                  </option>
                )
              )}

            </select>

${
  description
    ? `            <small>
              ${EscapeText(
                description
              )}
            </small>`
    : ""
}

          </div>
`;
  }

  if (
    field.type === "ObjectId"
  ) {
    return `
          <div className="form-group">

            <label>
              ${label}
            </label>

            <input
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              placeholder="${
                field.ref
                  ? `${field.ref} ID`
                  : "Reference ID"
              }"
              ${required}
            />

${
  description
    ? `            <small>
              ${EscapeText(
                description
              )}
            </small>`
    : ""
}

          </div>
`;
  }


  /* -------------------------------------------------------
     Default String / Mixed
     ------------------------------------------------------- */

  return `
          <div className="form-group">

            <label>
              ${label}
            </label>

            <input
              name="${fieldName}"
              value={
                form.${fieldName}
              }
              onChange={
                HandleChange
              }
              ${required}
            />

${
  description
    ? `            <small>
              ${EscapeText(
                description
              )}
            </small>`
    : ""
}

          </div>
`;
};


/* =========================================================
   Simple Page For Non-Entity Pages
   ========================================================= */

const GenerateSimplePage = (
  componentName,
  displayName,
  description,
  applicationName
) => {
  return `import React from "react";


const ${componentName} = () => {
  return (

    <main className="page-shell">

      <section className="page-header">

        <span className="eyebrow">
          ${applicationName}
        </span>

        <h1>
          ${displayName}
        </h1>

        <p>
          ${EscapeText(
            description
          )}
        </p>

      </section>

    </main>
  );
};


export default ${componentName};
`;
};


/* =========================================================
   Human Readable Labels

   serialNumber
   ->
   Serial Number
   ========================================================= */

const FormatLabel = (
  value = ""
) => {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /[_-]/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};


/* =========================================================
   Escape Generated Text

   Prevents generated descriptions from breaking
   JSX template strings.
   ========================================================= */

const EscapeText = (
  value = ""
) => {
  return String(value)
    .replace(/`/g, "'")
    .replace(/\$/g, "");
};


/* =========================================================
   Exports
   ========================================================= */

module.exports = {
  GenerateFrontendFiles,
  GeneratePageComponent,
  GenerateFormField,
  GenerateSimplePage,
  NormalizeComponentName,
  NormalizeEntityName,
  GetReferenceFields,
  LowerFirst,
  GetAvailableEntityNames,
  GetReferenceOptionVariable,
  BuildLookupPath,
  FormatLabel,
  EscapeText,
};
