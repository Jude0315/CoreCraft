/* =========================================================
   CoreCraft Dynamic Backend Generator

   This file generates Express controllers and routes
   directly from the AI generation specification.

   It contains NO LMS-specific entities or roles.

   Example supported applications:
   - Construction maintenance system
   - Clinic appointment system
   - Vehicle rental system
   - Hotel reservation system
   - Employee leave system
   - Inventory system
   - Any other dynamically described MERN application
   ========================================================= */


/* =========================================================
   Helper: Normalize Entity Name

   Example:
   "maintenance job" -> "MaintenanceJob"
   "Machine"         -> "Machine"
   ========================================================= */

const NormalizeEntityName = (name = "") => {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) =>
      char.toUpperCase()
    )
    .replace(/^./, (char) =>
      char.toUpperCase()
    );
};


const GenerateSectionComment = (
  lines = []
) => {
  return lines
    .map(
      (line) =>
        `// ${line}`
    )
    .join("\n");
};


const GetControllerComment = (
  operation,
  entityName
) => {
  const comments = {
    read:
      `Retrieves ${entityName} records from MongoDB and returns them to the frontend.`,

    create:
      `Creates a new ${entityName} record using data received from the request body.`,

    update:
      `Updates an existing ${entityName} record using the ID provided in the request URL.`,

    delete:
      `Deletes the selected ${entityName} record from MongoDB.`,
  };

  return (
    comments[operation] ||
    `Handles a ${entityName} API operation.`
  );
};


/* =========================================================
   Helper: Get Entity Name

   Supports both:
   "Machine"

   and:

   {
     name: "Machine",
     fields: [...]
   }
   ========================================================= */

const GetEntityName = (entity) => {
  if (typeof entity === "string") {
    return NormalizeEntityName(entity);
  }

  return NormalizeEntityName(
    entity?.name || ""
  );
};


/* =========================================================
   Helper: Find API Module For Entity

   The AI specification controls what operations are
   available for each entity.

   Example:

   {
     entity: "Inspection",
     operations: ["create", "read"],
     protected: true,
     roles: ["technician"]
   }
   ========================================================= */

const FindApiModule = (
  entityName,
  apiModules
) => {
  return apiModules.find(
    (module) =>
      NormalizeEntityName(
        module.entity
      ) === entityName
  );
};


const GetPopulateStatements = (
  entity
) => {
  return (
    entity?.fields || []
  )
    .filter(
      (field) =>
        field.type ===
          "ObjectId" &&
        field.ref
    )
    .map((field) => {
      const selectFields =
        Array.isArray(
          field.displayFields
        ) &&
        field.displayFields.length > 0
          ? field.displayFields.join(" ")
          : "";

      return `
        .populate({
          path:
            "${field.name}",
          select:
            "${selectFields}"
        })`;
    })
    .join("");
};


/* =========================================================
   Generate All Backend Files
   ========================================================= */

const GenerateBackendFiles = (
  specification
) => {
  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const entities =
    Array.isArray(specification.entities)
      ? specification.entities
      : [];

  const apiModules =
    Array.isArray(
      specification.apiModules
    )
      ? specification.apiModules
      : [];

  const controllerFiles = [];
  const routeFiles = [];

  // Each entity from the AI-shaped specification gets a matching controller and router.
  entities.forEach((entity) => {
    const entityName =
      GetEntityName(entity);

    if (!entityName) {
      return;
    }

    const apiModule =
      FindApiModule(
        entityName,
        apiModules
      );

    /*
      If the AI did not explicitly create an API module,
      CoreCraft generates standard CRUD as a safe fallback.
    */
    const operations =
      Array.isArray(
        apiModule?.operations
      ) &&
      apiModule.operations.length > 0
        ? apiModule.operations
        : [
            "create",
            "read",
            "update",
            "delete",
          ];

    controllerFiles.push({
      type: "controller",
      entity: entityName,

      filename:
        `${entityName}Controller.js`,

      content:
        GenerateController(
          entityName,
          operations,
          entity
        ),
    });

    routeFiles.push({
      type: "route",
      entity: entityName,

      filename:
        `${entityName}Routes.js`,

      content:
        GenerateRoute(
          entityName,
          apiModule,
          operations
        ),
    });
  });

  return {
    controllerFiles,
    routeFiles,
    apiModules,
  };
};


/* =========================================================
   Generate Controller
   ========================================================= */

const GenerateController = (
  entity,
  operations = [],
  entitySpecification = null
) => {
  const normalizedOperations =
    operations.map((operation) =>
      operation.toLowerCase()
    );

  const populateStatements =
    GetPopulateStatements(
      entitySpecification
    );

  // AI assistance helps decide the operations, but this generator writes the final Express code.
  const functions = [];
  const exportsList = [];


  /* -------------------------------------------------------
     CREATE
     ------------------------------------------------------- */

  if (
    normalizedOperations.includes(
      "create"
    )
  ) {
    functions.push(`
// ${GetControllerComment(
  "create",
  entity
)}
const Create${entity} = async (req, res) => {
  try {
    const item =
      await ${entity}.create(
        req.body
      );

    return res
      .status(201)
      .json({
        message:
          "${entity} created successfully",

        data: item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};
`);

    exportsList.push(
      `Create${entity}`
    );
  }


  /* -------------------------------------------------------
     READ
     ------------------------------------------------------- */

  if (
    normalizedOperations.includes(
      "read"
    ) ||
    normalizedOperations.includes(
      "view"
    )
  ) {
    functions.push(`
// ${GetControllerComment(
  "read",
  entity
)}
// Related reference fields are populated so users see readable values instead of database IDs.
const GetAll${entity}s = async (req, res) => {
  try {
    const items =
      await ${entity}
        .find()${populateStatements};

    return res
      .status(200)
      .json({
        count:
          items.length,

        data:
          items,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


// ${GetControllerComment(
  "read",
  entity
)}
// Related reference fields are populated so users see readable values instead of database IDs.
const Get${entity}ById = async (req, res) => {
  try {
    const item =
      await ${entity}
        .findById(
          req.params.id
        )${populateStatements};

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "${entity} not found",
        });
    }

    return res
      .status(200)
      .json({
        data:
          item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};
`);

    exportsList.push(
      `GetAll${entity}s`
    );

    exportsList.push(
      `Get${entity}ById`
    );
  }


  /* -------------------------------------------------------
     UPDATE
     ------------------------------------------------------- */

  if (
    normalizedOperations.includes(
      "update"
    )
  ) {
    functions.push(`
// ${GetControllerComment(
  "update",
  entity
)}
const Update${entity} = async (req, res) => {
  try {
    const item =
      await ${entity}.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "${entity} not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "${entity} updated successfully",

        data:
          item,
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};
`);

    exportsList.push(
      `Update${entity}`
    );
  }


  /* -------------------------------------------------------
     DELETE
     ------------------------------------------------------- */

  if (
    normalizedOperations.includes(
      "delete"
    )
  ) {
    functions.push(`
// ${GetControllerComment(
  "delete",
  entity
)}
const Delete${entity} = async (req, res) => {
  try {
    const item =
      await ${entity}.findByIdAndDelete(
        req.params.id
      );

    if (!item) {
      return res
        .status(404)
        .json({
          message:
            "${entity} not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "${entity} deleted successfully",
      });
  } catch (error) {
    // Unexpected errors are returned with a useful message for the frontend.
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};
`);

    exportsList.push(
      `Delete${entity}`
    );
  }


  /* -------------------------------------------------------
     Final Controller File
     ------------------------------------------------------- */

  return `const ${entity} =
  require("../Models/${entity}");

${functions.join("\n")}

module.exports = {
  ${exportsList.join(",\n  ")}
};
`;
};


/* =========================================================
   Generate Route Middleware
   ========================================================= */

const GetRolesForOperation = (
  apiModule = {},
  operation = ""
) => {
  const roleActions =
    Array.isArray(
      apiModule?.roleActions
    )
      ? apiModule.roleActions
      : [];

  if (
    roleActions.length === 0
  ) {
    return (
      apiModule?.roles || []
    );
  }

  const operationAliases =
    operation === "read"
      ? [
          "read",
          "view",
        ]
      : operation === "update"
        ? [
            "update",
            "edit",
          ]
      : [
          operation,
        ];

  // Match page-style actions such as "view" and "edit" to API-style operations.
  return roleActions
    .filter((entry) =>
      (entry.actions || [])
        .some((action) =>
          operationAliases.includes(
            String(action)
              .toLowerCase()
          )
        )
    )
    .map(
      (entry) =>
        entry.role
    )
    .filter(
      (role, index, roles) =>
        roles.indexOf(role) ===
        index
    );
};


const GenerateMiddleware = (
  apiModule,
  roles = []
) => {
  if (!apiModule) {
    return "";
  }

  const isProtected =
    apiModule.protected === true;

  const hasRoleActions =
    Array.isArray(
      apiModule.roleActions
    ) &&
    apiModule.roleActions.length > 0;

  if (!isProtected) {
    return "";
  }

  if (
    hasRoleActions &&
    roles.length === 0
  ) {
    return `AuthMiddleware, AllowRoles("__no_allowed_roles__"), `;
  }

  /*
    Protected, but no role restriction.

    Example:
    AuthMiddleware,
  */
  if (roles.length === 0) {
    return "AuthMiddleware, ";
  }

  /*
    Protected and role restricted.

    Example:
    AuthMiddleware,
    AllowRoles("technician", "manager"),
  */
  const roleArguments =
    roles
      .map(
        (role) =>
          `"${role}"`
      )
      .join(", ");

  return `AuthMiddleware, AllowRoles(${roleArguments}), `;
};


/* =========================================================
   Generate Express Route File
   ========================================================= */

const GenerateRoute = (
  entity,
  apiModule = {},
  operations = []
) => {
  const normalizedOperations =
    operations.map((operation) =>
      operation.toLowerCase()
    );

  const protectedRoute =
    apiModule?.protected === true;

  const createRoles =
    GetRolesForOperation(
      apiModule,
      "create"
    );

  const readRoles =
    GetRolesForOperation(
      apiModule,
      "read"
    );

  const updateRoles =
    GetRolesForOperation(
      apiModule,
      "update"
    );

  const deleteRoles =
    GetRolesForOperation(
      apiModule,
      "delete"
    );

  const routeRoles =
    [
      ...createRoles,
      ...readRoles,
      ...updateRoles,
      ...deleteRoles,
    ];

  const hasRoleActions =
    Array.isArray(
      apiModule?.roleActions
    ) &&
    apiModule.roleActions.length > 0;

  const imports = [];


  /* -------------------------------------------------------
     Controller Imports
     ------------------------------------------------------- */

  if (
    normalizedOperations.includes(
      "create"
    )
  ) {
    imports.push(
      `Create${entity}`
    );
  }

  if (
    normalizedOperations.includes(
      "read"
    ) ||
    normalizedOperations.includes(
      "view"
    )
  ) {
    imports.push(
      `GetAll${entity}s`
    );

    imports.push(
      `Get${entity}ById`
    );
  }

  if (
    normalizedOperations.includes(
      "update"
    )
  ) {
    imports.push(
      `Update${entity}`
    );
  }

  if (
    normalizedOperations.includes(
      "delete"
    )
  ) {
    imports.push(
      `Delete${entity}`
    );
  }


  /* -------------------------------------------------------
     Middleware Imports
     ------------------------------------------------------- */

  let middlewareImports = "";

  if (protectedRoute) {
    middlewareImports += `
const AuthMiddleware =
  require("../Middleware/AuthMiddleware");
`;

    if (
      routeRoles.length > 0 ||
      hasRoleActions
    ) {
      middlewareImports += `
const AllowRoles =
  require("../Middleware/RoleMiddleware");
`;
    }
  }


  /* -------------------------------------------------------
     Middleware Expression
     ------------------------------------------------------- */

  const createMiddleware =
    GenerateMiddleware(
      apiModule,
      createRoles
    );

  const readMiddleware =
    GenerateMiddleware(
      apiModule,
      readRoles
    );

  const updateMiddleware =
    GenerateMiddleware(
      apiModule,
      updateRoles
    );

  const deleteMiddleware =
    GenerateMiddleware(
      apiModule,
      deleteRoles
    );

  const protectedOperationComment =
    protectedRoute
      ? `${GenerateSectionComment([
          "The JWT middleware confirms that the request comes from a logged-in user.",
          "AllowRoles then checks whether that user's role can perform this operation.",
        ])}
`
      : "";


  /* -------------------------------------------------------
     Route Definitions
     ------------------------------------------------------- */

  const routes = [];


  if (
    normalizedOperations.includes(
      "create"
    )
  ) {
    routes.push(`
${protectedOperationComment}
Router.post(
  "/",
  ${createMiddleware}Create${entity}
);
`);
  }


  if (
    normalizedOperations.includes(
      "read"
    ) ||
    normalizedOperations.includes(
      "view"
    )
  ) {
    routes.push(`
${protectedOperationComment}
Router.get(
  "/",
  ${readMiddleware}GetAll${entity}s
);

${protectedOperationComment}
Router.get(
  "/:id",
  ${readMiddleware}Get${entity}ById
);
`);
  }


  if (
    normalizedOperations.includes(
      "update"
    )
  ) {
    routes.push(`
${protectedOperationComment}
Router.put(
  "/:id",
  ${updateMiddleware}Update${entity}
);
`);
  }


  if (
    normalizedOperations.includes(
      "delete"
    )
  ) {
    routes.push(`
${protectedOperationComment}
Router.delete(
  "/:id",
  ${deleteMiddleware}Delete${entity}
);
`);
  }


  /* -------------------------------------------------------
     Final Route File
     ------------------------------------------------------- */

  return `const express =
  require("express");

const {
  ${imports.join(",\n  ")}
} =
  require("../Controllers/${entity}Controller");
${middlewareImports}

${GenerateSectionComment([
  `This router defines the REST API endpoints for ${entity}.`,
  "Authentication runs first, followed by role-based authorization when required.",
])}
const Router =
  express.Router();

${routes.join("\n")}

module.exports =
  Router;
`;
};


/* =========================================================
   Exports
   ========================================================= */

module.exports = {
  GenerateBackendFiles,
  GenerateController,
  GenerateRoute,
  GenerateSectionComment,
  GetControllerComment,
  GetRolesForOperation,
  GetPopulateStatements,
  GetEntityName,
  NormalizeEntityName,
};
