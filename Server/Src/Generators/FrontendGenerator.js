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


const RequiresAuthentication = (
  specification = {}
) => {
  return (
    (specification.roles || []).length > 0 ||
    (specification.pages || []).some(
      (page) => page?.protected
    ) ||
    (specification.apiModules || []).some(
      (module) => module?.protected
    )
  );
};


const GetInfrastructureUserEntity = (
  specification
) => ({
    name: "User",

    description:
      "Application user managed through CoreCraft authentication infrastructure.",

    fields: [
      {
        name: "name",
        type: "String",
        required: true,
        unique: false,
        defaultValue: null,
        ref: "",
        referenceFilter: null,
        displayFields: [],
        enumValues: [],
        description:
          "The user's name.",
      },

      {
        name: "email",
        type: "String",
        required: true,
        unique: true,
        defaultValue: null,
        ref: "",
        referenceFilter: null,
        displayFields: [],
        enumValues: [],
        description:
          "The user's email address.",
      },

      {
        name: "password",
        type: "String",
        required: true,
        unique: false,
        defaultValue: null,
        ref: "",
        referenceFilter: null,
        displayFields: [],
        enumValues: [],
        description:
          "The user's password.",
      },

      {
        name: "role",
        type: "String",
        required: true,
        unique: false,
        defaultValue: null,
        ref: "",
        referenceFilter: null,
        displayFields: [],
        enumValues:
          specification.roles || [],
        description:
          "The user's application role.",
      },
    ],
  });


const GetPageEntity = (
  specification,
  page
) => {
  if (!page?.entity) {
    return null;
  }

  const normalizedName =
    NormalizeEntityName(
      page.entity
    ).toLowerCase();

  if (
    normalizedName === "user" &&
    RequiresAuthentication(
      specification
    )
  ) {
    return GetInfrastructureUserEntity(
      specification
    );
  }

  return (
    specification.entities || []
  ).find(
    (entity) =>
      NormalizeEntityName(
        entity.name
      ).toLowerCase() ===
      normalizedName
  ) || null;
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


const GetDashboardSources = (
  specification,
  page
) => {
  const pageRoles =
    Array.isArray(page?.roles)
      ? page.roles
      : [];

  return (
    specification.apiModules || []
  )
    .filter((module) => {
      const canRead =
        (module.operations || [])
          .some(
            (operation) =>
              [
                "read",
                "view",
              ].includes(
                String(
                  operation
                ).toLowerCase()
              )
          );

      if (!canRead) {
        return false;
      }

      const moduleRoles =
        Array.isArray(
          module.roles
        )
          ? module.roles
          : [];

      if (
        pageRoles.length === 0 ||
        moduleRoles.length === 0
      ) {
        return true;
      }

      return pageRoles.some(
        (role) =>
          moduleRoles.includes(
            role
          )
      );
    })
    .filter(
      (module) =>
        module.entity
    );
};


const GenerateTableCell = (
  field
) => {
  return `                <td>
                  {GetDisplayValue(
                    item.${field.name},
                    "${field.type}",
                    ${JSON.stringify(
                      field.displayFields || []
                    )}
                  )}
                </td>`;
};


const GenerateEditFormFields = (
  entity
) => {
  return (
    entity.fields || []
  )
    .filter(
      (field) =>
        field.name !== "_id"
    )
    .map(
      (field) => `      ${field.name}:
        NormalizeFormValue(
          item.${field.name},
          "${field.type}"
        )`
    )
    .join(",\n");
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
        GetPageEntity(
          specification,
          page
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

  const hasEntity =
    Boolean(entity);

  const entityName =
    hasEntity
      ? entity.name
      : "";

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

  if (
    page?.type === "dashboard"
  ) {
    return GenerateDashboardPage(
      specification,
      page,
      componentName,
      applicationName
    );
  }


  /* -------------------------------------------------------
     If page does not represent a generated entity,
     generate simple informational page.
     ------------------------------------------------------- */

  if (!hasEntity) {
    return GenerateSimplePage(
      componentName,
      displayName,
      description,
      applicationName
    );
  }

  const apiName =
    `${NormalizeEntityName(
      entityName
    )}Api`;

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

  const needsForm =
    canCreate ||
    canEdit;

  const usesRuntimePermissions =
    canCreate ||
    canEdit ||
    canDelete;

  const usesAuthPermissions =
    usesRuntimePermissions &&
    RequiresAuthentication(
      specification
    );

  const availableEntityNames =
    GetAvailableEntityNames(
      specification
    );

  const referenceFields =
    needsForm
      ? GetReferenceFields(entity)
          .filter((field) =>
            availableEntityNames.has(
              NormalizeEntityName(
                field.ref
              )
            )
          )
      : [];

  const apiImportStatement =
    referenceFields.length > 0
      ? `
import API, {
  ${apiName}
} from "../Services/Api";`
      : `
import {
  ${apiName}
} from "../Services/Api";`;

  const authImportStatement =
    usesAuthPermissions
      ? `
import {
  useAuth,
} from "../Context/AuthContext";`
      : "";

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
          referenceFields,
          entity,
          canEdit
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
    // Loads valid options for the ${field.name} relationship field.
    // Any referenceFilter from the generated specification is enforced by the backend lookup API.
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

  const authStateCode =
    usesAuthPermissions
      ? `
  const {
    user,
  } = useAuth();
`
      : usesRuntimePermissions
        ? `
  const user = null;
`
        : "";

  const permissionHelpersCode =
    usesRuntimePermissions
      ? `

  const pageActions =
    ${JSON.stringify(
      page?.actions || []
    )};

  const roleActions =
    ${JSON.stringify(
      page?.roleActions || []
    )};


  const CanPerformAction = (
    role,
    action,
    roleActions,
    fallbackActions
  ) => {
    if (
      !Array.isArray(roleActions) ||
      roleActions.length === 0
    ) {
      return (
        fallbackActions ||
        []
      )
        .map((item) =>
          String(item)
            .toLowerCase()
        )
        .includes(action);
    }

    const permission =
      roleActions.find(
        (entry) =>
          entry.role === role
      );

    return Boolean(
      permission?.actions
        ?.map((item) =>
          String(item)
            .toLowerCase()
        )
        .includes(action)
    );
  };


  // Checks whether the logged-in user's role can create records on this page.
  const canCreate =
    CanPerformAction(
      user?.role,
      "create",
      roleActions,
      pageActions
    );

  // Checks whether the logged-in user's role can edit records on this page.
  const canEdit =
    CanPerformAction(
      user?.role,
      "edit",
      roleActions,
      pageActions
    ) ||
    CanPerformAction(
      user?.role,
      "update",
      roleActions,
      pageActions
    );

  // Checks whether the logged-in user's role can delete records on this page.
  const canDelete =
    CanPerformAction(
      user?.role,
      "delete",
      roleActions,
      pageActions
    );
`
      : "";

  const feedbackHelpersCode = `

  const GetErrorMessage = (
    error,
    fallbackMessage
  ) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  };


  const GetSuccessMessage = (
    action
  ) => {
    switch (action) {
      case "create":
        return "Created successfully.";

      case "update":
        return "Updated successfully.";

      case "delete":
        return "Deleted successfully.";

      default:
        return "Operation completed successfully.";
    }
  };
`;

  const formValidationCode =
    canCreate || canEdit
      ? `

  const formFields =
    ${JSON.stringify(
      fields.filter(
        (field) =>
          field.name !== "_id"
      )
    )};


  const ValidateForm = (
    form,
    fields,
    editingId = null
  ) => {
    const errors = [];

    for (const field of fields) {
      const value =
        form[field.name];

      const isPasswordOnEdit =
        editingId &&
        field.name === "password";

      if (
        field.required &&
        !isPasswordOnEdit &&
        (
          value === "" ||
          value === null ||
          value === undefined
        )
      ) {
        errors.push(
          \`\${field.name} is required.\`
        );

        continue;
      }

      if (
        field.type === "Number" &&
        value !== "" &&
        value !== null &&
        value !== undefined &&
        Number.isNaN(
          Number(value)
        )
      ) {
        errors.push(
          \`\${field.name} must be a valid number.\`
        );
      }

      if (
        field.type === "Date" &&
        value
      ) {
        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          errors.push(
            \`\${field.name} must be a valid date.\`
          );
        }
      }
    }

    return errors;
  };
`
      : "";


  /* -------------------------------------------------------
     Generate table headings
     ------------------------------------------------------- */

  const tableHeaders =
    fields
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
      .map(
        (field) =>
          GenerateTableCell(
            field
          )
      )
      .join("\n");

  const listState =
    canView
      ? `
  // Stores the records loaded from the backend API.
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

  // Loads the existing records when the page opens.
  const LoadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await ${apiName}.getAll();

      setItems(
        response.data.data || []
      );
    } catch (error) {
      console.error(error);

      setError(
        GetErrorMessage(
          error,
          "Unable to load records."
        )
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
          GetSuccessMessage(
            "update"
          )
        );
      } else {
        await ${apiName}.create(
          payload
        );

        setSuccess(
          GetSuccessMessage(
            "create"
          )
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
          GetSuccessMessage(
            "update"
          )
        );
      }`;
  } else if (canCreate) {
    submitActionCode = `
      await ${apiName}.create(
        payload
      );

      setSuccess(
        GetSuccessMessage(
          "create"
        )
      );`;
  }

  const editFormMapping =
    GenerateEditFormFields(
      entity
    );

  const normalizeFormValueCode =
    canEdit
      ? `

  const NormalizeFormValue = (
    value,
    type
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (
      type === "ObjectId"
    ) {
      if (
        typeof value === "object"
      ) {
        return (
          value._id ||
          ""
        );
      }

      return value;
    }

    if (
      type === "Date"
    ) {
      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      const offset =
        date.getTimezoneOffset();

      const localDate =
        new Date(
          date.getTime() -
          offset * 60 * 1000
        );

      return localDate
        .toISOString()
        .slice(
          0,
          16
        );
    }

    if (
      type === "Boolean"
    ) {
      return Boolean(value);
    }

    return value;
  };
`
      : "";

  const cancelEditCode =
    canEdit
      ? `

  const HandleCancelEdit = () => {
    setEditingId(
      null
    );

    setForm(
      initialForm
    );
  };
`
      : "";

  const editHandlerCode =
    canEdit
      ? `

  /* -------------------------------------------------------
     Edit
     ------------------------------------------------------- */

  // Loads the selected record into the form so the user can edit it.
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

  // Sends a delete request for the selected record and refreshes the list afterwards.
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
      setError("");

      await ${apiName}.remove(
        id
      );

      setSuccess(
        GetSuccessMessage(
          "delete"
        )
      );

${reloadItemsCode}
    } catch (error) {
      console.error(error);

      setError(
        GetErrorMessage(
          error,
          "Unable to delete record."
        )
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

  const GetDisplayValue = (
    value,
    type,
    displayFields = []
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (
      type === "ObjectId"
    ) {
      if (
        typeof value !== "object"
      ) {
        return String(value);
      }

      for (
        const field
        of displayFields
      ) {
        if (
          value[field] !==
            undefined &&
          value[field] !==
            null
        ) {
          const displayValue =
            value[field];

          const shouldFormatDate =
            String(field)
              .toLowerCase()
              .includes("date") ||
            String(field)
              .toLowerCase()
              .includes("time");

          if (shouldFormatDate) {
            const date =
              new Date(
                displayValue
              );

            if (
              !Number.isNaN(
                date.getTime()
              )
            ) {
              return date
                .toLocaleString();
            }
          }

          return String(
            displayValue
          );
        }
      }

      return (
        value.name ||
        value.title ||
        value._id ||
        "-"
      );
    }

    if (
      type === "Date"
    ) {
      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return String(value);
      }

      return date.toLocaleString();
    }

    if (
      type === "Boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    if (
      Array.isArray(value)
    ) {
      return value.join(", ");
    }

    return String(value);
  };
`
      : "";

  const validationEditingArgument =
    canEdit
      ? "editingId"
      : "null";

  let permissionGuardCode = "";

  if (
    canCreate &&
    canEdit
  ) {
    permissionGuardCode = `
    if (
      editingId &&
      !canEdit
    ) {
      setError(
        "You do not have permission to update this record."
      );

      return;
    }

    if (
      !editingId &&
      !canCreate
    ) {
      setError(
        "You do not have permission to create this record."
      );

      return;
    }
`;
  } else if (canCreate) {
    permissionGuardCode = `
    if (!canCreate) {
      setError(
        "You do not have permission to create this record."
      );

      return;
    }
`;
  } else if (canEdit) {
    permissionGuardCode = `
    if (!canEdit) {
      setError(
        "You do not have permission to update this record."
      );

      return;
    }
`;
  }

  const formSupportCode =
    canCreate || canEdit
      ? `

  /* -------------------------------------------------------
     Reset form
     ------------------------------------------------------- */

  const ResetForm = () => {
    setForm(
      initialForm
    );

${resetEditingCode}
  };


  /* -------------------------------------------------------
     Clean payload before saving
     ------------------------------------------------------- */

  // Builds a clean request payload before sending form data to the backend.
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

    const validationErrors =
      ValidateForm(
        form,
        formFields,
        ${validationEditingArgument}
      );

    if (
      validationErrors.length > 0
    ) {
      setError(
        validationErrors[0]
      );

      return;
    }

${permissionGuardCode}

    try {
      // Builds a clean request payload before sending form data to the backend.
      const payload =
        BuildPayload();

${submitActionCode}

      ResetForm();

${reloadItemsCode}
    } catch (error) {
      console.error(error);

      setError(
        GetErrorMessage(
          error,
          "Unable to save record."
        )
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
                onClick={HandleCancelEdit}
              >
                Cancel
              </button>
            )}
`
      : "";

  const formRenderCondition =
    canCreate &&
    canEdit
      ? "canCreate || (canEdit && editingId)"
      : canCreate
        ? "canCreate"
        : "canEdit && editingId";


  /* -------------------------------------------------------
     Create imports
     ------------------------------------------------------- */

  return `import React, {
  useEffect,
  useState,
} from "react";

${authImportStatement}

${apiImportStatement}


const ${componentName} = () => {
  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

${listState}

${editingState}

  const initialForm = {
${initialFormFields}
  };

  // Stores the values currently entered in the create or edit form.
  const [form, setForm] =
    useState(
      initialForm
    );

${authStateCode}

${referenceState}

${permissionHelpersCode}

${feedbackHelpersCode}

${formValidationCode}

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

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };


${formSupportCode}

${normalizeFormValueCode}

${cancelEditCode}

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
      {(${formRenderCondition}) && (
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
      )}
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
    ? `                  {(canEdit || canDelete) && (
                    <th>
                      Actions
                    </th>
                  )}`
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
    ? `                      {(canEdit || canDelete) && (
                        <td>

                          <div className="row-actions">

${
  canEdit
    ? `                            {canEdit && (
                              <button
                                className="secondary-button"
                                onClick={() =>
                                  HandleEdit(item)
                                }
                              >
                                Edit
                              </button>
                            )}`
    : ""
}

${
  canDelete
    ? `                            {canDelete && (
                              <button
                                className="danger-button"
                                onClick={() =>
                                  HandleDelete(
                                    item._id
                                  )
                                }
                              >
                                Delete
                              </button>
                            )}`
    : ""
}

                          </div>

                        </td>
                      )}`
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


const GenerateInputControl = (
  field,
  formState,
  setFormState,
  lookupStateName = "",
  entity = null,
  canEdit = false
) => {
  const fieldName =
    field.name;

  const label =
    FormatLabel(
      fieldName
    );

  const isPasswordField =
    field.name === "password" &&
    NormalizeEntityName(
      entity?.name || ""
    ).toLowerCase() === "user";

  const requiredAttribute =
    field.required
      ? isPasswordField &&
        canEdit
        ? "required={!editingId}"
        : "required"
      : "";

  const description =
    field.description || "";

  const inputType =
    field.name === "password"
      ? "password"
      : field.type === "Number"
        ? "number"
        : field.type === "Date"
          ? "datetime-local"
          : "text";


  if (
    field.type === "ObjectId" &&
    lookupStateName
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
                ${formState}.${fieldName} ||
                ""
              }
              onChange={
                HandleChange
              }
              ${requiredAttribute}
            >

              <option value="">
                Select ${label}
              </option>

              {${lookupStateName}.map(
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
                    ${formState}.${fieldName}
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
                ${formState}.${fieldName} ||
                ""
              }
              onChange={
                HandleChange
              }
              ${requiredAttribute}
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
                ${formState}.${fieldName} ||
                ""
              }
              onChange={
                HandleChange
              }
              placeholder="${
                field.ref
                  ? `${field.ref} ID`
                  : "Reference ID"
              }"
              ${requiredAttribute}
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
     String / Number / Date / Mixed
     ------------------------------------------------------- */

  return `
          <div className="form-group">

            <label>
              ${label}
            </label>

            <input
              type="${inputType}"
              id="${fieldName}"
              name="${fieldName}"
              value={
                ${formState}.${fieldName} ||
                ""
              }
              onChange={
                HandleChange
              }
              ${requiredAttribute}
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
   Generate Form Field
   ========================================================= */

const GenerateFormField = (
  field,
  referenceFields = [],
  entity = null,
  canEdit = false
) => {
  const lookupField =
    referenceFields.find(
      (referenceField) =>
        referenceField.name ===
          field.name &&
        referenceField.ref ===
          field.ref
    );

  const lookupStateName =
    lookupField
      ? GetReferenceOptionVariable(
          field
        )
      : "";

  return GenerateInputControl(
    field,
    "form",
    "setForm",
    lookupStateName,
    entity,
    canEdit
  );
};


/* =========================================================
   Dashboard Page
   ========================================================= */

const GenerateDashboardPage = (
  specification,
  page,
  componentName,
  applicationName
) => {
  const displayName =
    page?.name ||
    componentName;

  const description =
    page?.description ||
    `Review key activity for ${applicationName}.`;

  const sources =
    GetDashboardSources(
      specification,
      page
    );

  const uniqueSources =
    [
      ...new Map(
        sources.map((source) => [
          NormalizeEntityName(
            source.entity
          ),
          source,
        ])
      ).values(),
    ];

  const imports =
    uniqueSources.map((source) => {
      const entityName =
        NormalizeEntityName(
          source.entity
        );

      return `${entityName}Api`;
    });

  const uniqueImports =
    [...new Set(imports)];

  const apiImportStatement =
    uniqueImports.length > 0
      ? `
import {
  ${uniqueImports.join(",\n  ")}
} from "../Services/Api";
`
      : "";

  const reactImport =
    uniqueImports.length > 0
      ? `import React, {
  useEffect,
  useState,
} from "react";`
      : `import React from "react";`;

  const stateCode =
    uniqueSources
      .map((source) => {
        const entityName =
          NormalizeEntityName(
            source.entity
          );

        const variableName =
          LowerFirst(
            entityName
          );

        return `
  const [
    ${variableName}Count,
    set${entityName}Count
  ] = useState(0);
`;
      })
      .join("\n");

  const loadCode =
    uniqueSources
      .map((source) => {
        const entityName =
          NormalizeEntityName(
            source.entity
          );

        const variableName =
          LowerFirst(
            entityName
          );

        return `
      try {
        const response =
          await ${entityName}Api.getAll();

        const payload =
          response.data;

        const records =
          Array.isArray(payload)
            ? payload
            : payload?.items ||
              payload?.data ||
              payload?.records ||
              [];

        const count =
          typeof payload?.count === "number"
            ? payload.count
            : Array.isArray(records)
              ? records.length
              : 0;

        set${entityName}Count(
          count
        );
      } catch (error) {
        console.error(
          "Unable to load ${source.entity} dashboard data:",
          error
        );
      }
`;
      })
      .join("\n");

  const loadFunction =
    uniqueSources.length > 0
      ? `
  const LoadDashboardData = async () => {
${loadCode}
  };


  useEffect(() => {
    LoadDashboardData();
  }, []);
`
      : "";

  const cards =
    uniqueSources.length > 0
      ? uniqueSources
          .map((source) => {
            const entityName =
              NormalizeEntityName(
                source.entity
              );

            const variableName =
              LowerFirst(
                entityName
              );

            return `
          <article className="stat-card">

            <span className="stat-label">
              ${FormatLabel(source.entity)}
            </span>

            <strong className="stat-value">
              {${variableName}Count}
            </strong>

          </article>`;
          })
          .join("\n")
      : `
          <article className="stat-card">

            <span className="stat-label">
              Dashboard
            </span>

            <strong className="stat-value">
              Ready
            </strong>

          </article>`;

  return `${reactImport}

${apiImportStatement}

const ${componentName} = () => {
${stateCode}
${loadFunction}

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


      <section className="dashboard-grid">
${cards}
      </section>

    </main>
  );
};


export default ${componentName};
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
  GenerateDashboardPage,
  GenerateTableCell,
  GenerateInputControl,
  GenerateFormField,
  GenerateSimplePage,
  GetInfrastructureUserEntity,
  GetPageEntity,
  NormalizeComponentName,
  NormalizeEntityName,
  GetReferenceFields,
  LowerFirst,
  GetAvailableEntityNames,
  GetReferenceOptionVariable,
  BuildLookupPath,
  GetDashboardSources,
  FormatLabel,
  EscapeText,
};
