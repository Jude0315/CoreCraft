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
          operations
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
  operations = []
) => {
  const normalizedOperations =
    operations.map((operation) =>
      operation.toLowerCase()
    );

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
    )
  ) {
    functions.push(`
const GetAll${entity}s = async (req, res) => {
  try {
    const items =
      await ${entity}.find();

    return res
      .status(200)
      .json({
        count:
          items.length,

        data:
          items,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};


const Get${entity}ById = async (req, res) => {
  try {
    const item =
      await ${entity}.findById(
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
        data:
          item,
      });
  } catch (error) {
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

const GenerateMiddleware = (
  apiModule
) => {
  if (!apiModule) {
    return "";
  }

  const isProtected =
    apiModule.protected === true;

  const roles =
    Array.isArray(
      apiModule.roles
    )
      ? apiModule.roles
      : [];

  if (!isProtected) {
    return "";
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

  const roles =
    Array.isArray(
      apiModule?.roles
    )
      ? apiModule.roles
      : [];

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

    if (roles.length > 0) {
      middlewareImports += `
const AllowRoles =
  require("../Middleware/RoleMiddleware");
`;
    }
  }


  /* -------------------------------------------------------
     Middleware Expression
     ------------------------------------------------------- */

  const middleware =
    GenerateMiddleware(
      apiModule
    );


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
Router.post(
  "/",
  ${middleware}Create${entity}
);
`);
  }


  if (
    normalizedOperations.includes(
      "read"
    )
  ) {
    routes.push(`
Router.get(
  "/",
  ${middleware}GetAll${entity}s
);

Router.get(
  "/:id",
  ${middleware}Get${entity}ById
);
`);
  }


  if (
    normalizedOperations.includes(
      "update"
    )
  ) {
    routes.push(`
Router.put(
  "/:id",
  ${middleware}Update${entity}
);
`);
  }


  if (
    normalizedOperations.includes(
      "delete"
    )
  ) {
    routes.push(`
Router.delete(
  "/:id",
  ${middleware}Delete${entity}
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
  GetEntityName,
  NormalizeEntityName,
};
