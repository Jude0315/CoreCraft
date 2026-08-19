const NormalizeEntityName = (
  value = ""
) => {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join("");
};


const LowerFirst = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toLowerCase() +
    value.slice(1)
  );
};


const GetReferenceFields = (
  specification = {}
) => {
  const references = [];


  (specification.entities || [])
    .forEach((entity) => {
      (entity.fields || [])
        .forEach((field) => {
          if (
            field.type !== "ObjectId" ||
            !field.ref
          ) {
            return;
          }

          references.push({
            sourceEntity:
              entity.name,

            fieldName:
              field.name,

            ref:
              field.ref,

            referenceFilter:
              field.referenceFilter ||
              null,

            displayFields:
              Array.isArray(
                field.displayFields
              )
                ? field.displayFields
                : [],
          });
        });
    });


  return references;
};


const GetLookupAccessRoles = (
  specification,
  sourceEntity
) => {
  const roles =
    new Set();


  (specification.pages || [])
    .filter((page) => {
      const matchesEntity =
        NormalizeEntityName(
          page.entity
        ) ===
        NormalizeEntityName(
          sourceEntity
        );

      if (!matchesEntity) {
        return false;
      }

      const actions =
        page.actions || [];

      const needsFormLookup =
        actions.includes(
          "create"
        ) ||
        actions.includes(
          "edit"
        ) ||
        actions.includes(
          "update"
        );

      return needsFormLookup;
    })
    .forEach((page) => {
      (page.roles || [])
        .forEach((role) => {
          roles.add(role);
        });
    });


  return [...roles];
};


const GenerateFilterObject = (
  referenceFilter
) => {
  if (
    !referenceFilter ||
    !referenceFilter.field ||
    !referenceFilter.operator
  ) {
    return "{}";
  }


  const field =
    JSON.stringify(
      referenceFilter.field
    );

  const value =
    JSON.stringify(
      referenceFilter.value
    );


  switch (
    referenceFilter.operator
  ) {
    case "equals":
      return `{
        [${field}]:
          ${value}
      }`;

    case "notEquals":
      return `{
        [${field}]: {
          $ne:
            ${value}
        }
      }`;

    case "in":
      return `{
        [${field}]: {
          $in:
            ${value}
        }
      }`;

    case "notIn":
      return `{
        [${field}]: {
          $nin:
            ${value}
        }
      }`;

    default:
      return "{}";
  }
};


const GenerateLookupController = (
  specification
) => {
  const references =
    GetReferenceFields(
      specification
    );


  const imports =
    [
      ...new Set(
        references.map(
          (reference) =>
            NormalizeEntityName(
              reference.ref
            )
        )
      ),
    ];


  const importCode =
    imports
      .map(
        (entityName) => `
const ${entityName} =
  require(
    "../Models/${entityName}"
  );`
      )
      .join("\n");


  const handlers =
    references
      .map((reference) => {
        const sourceEntity =
          NormalizeEntityName(
            reference.sourceEntity
          );

        const fieldName =
          NormalizeEntityName(
            reference.fieldName
          );

        const refEntity =
          NormalizeEntityName(
            reference.ref
          );

        const handlerName =
          `Get${sourceEntity}${fieldName}Lookup`;

        const filterObject =
          GenerateFilterObject(
            reference.referenceFilter
          );

        const displayFields =
          reference.displayFields.length > 0
            ? reference.displayFields
            : [
                "name",
                "title",
              ];

        const selectFields =
          [
            "_id",
            ...displayFields,
          ].join(" ");

        const labelValues =
          displayFields
            .map(
              (fieldName) =>
                `record[${JSON.stringify(
                  fieldName
                )}]`
            )
            .join(",\n                ");


        return `
const ${handlerName} =
  async (req, res) => {
    try {
      const filter =
        ${filterObject};

      const records =
        await ${refEntity}
          .find(filter)
          .select(
            "${selectFields}"
          )
          .lean();

      const items =
        records.map(
          (record) => ({
            _id:
              record._id,

            label:
              [
                ${labelValues}
              ]
                .filter(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                )
                .map(
                  (value) =>
                    String(value)
                )
                .join(" - ") ||
              String(
                record._id
              ),
          })
        );

      return res.json(items);

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });

    }
  };
`;
      })
      .join("\n");


  const exports =
    references
      .map((reference) => {
        const sourceEntity =
          NormalizeEntityName(
            reference.sourceEntity
          );

        const fieldName =
          NormalizeEntityName(
            reference.fieldName
          );

        return (
          `Get${sourceEntity}${fieldName}Lookup`
        );
      })
      .join(",\n  ");


  return `
${importCode}


${handlers}


module.exports = {
  ${exports}
};
`;
};


const GenerateLookupRoutes = (
  specification
) => {
  const references =
    GetReferenceFields(
      specification
    );

  const controllerImports =
    references
      .map((reference) => {
        const sourceEntity =
          NormalizeEntityName(
            reference.sourceEntity
          );

        const fieldName =
          NormalizeEntityName(
            reference.fieldName
          );

        return (
          `Get${sourceEntity}${fieldName}Lookup`
        );
      });


  const uniqueControllerImports =
    [...new Set(
      controllerImports
    )];


  const importCode = `
const express =
  require("express");

const {
  ${uniqueControllerImports.join(
    ",\n  "
  )}
} =
  require(
    "../Controllers/LookupController"
  );

const AuthMiddleware =
  require(
    "../Middleware/AuthMiddleware"
  );

const AllowRoles =
  require(
    "../Middleware/RoleMiddleware"
  );

const Router =
  express.Router();
`;


  const routeCode =
    references
      .map((reference) => {
        const sourceEntity =
          NormalizeEntityName(
            reference.sourceEntity
          );

        const fieldName =
          NormalizeEntityName(
            reference.fieldName
          );

        const sourcePath =
          LowerFirst(
            sourceEntity
          );

        const fieldPath =
          LowerFirst(
            fieldName
          );

        const handlerName =
          `Get${sourceEntity}${fieldName}Lookup`;

        const allowedRoles =
          GetLookupAccessRoles(
            specification,
            reference.sourceEntity
          );


        const roleMiddleware =
          allowedRoles.length > 0
            ? `AllowRoles(${allowedRoles
                .map(
                  (role) =>
                    JSON.stringify(
                      role
                    )
                )
                .join(", ")})`
            : null;


        const middleware =
          roleMiddleware
            ? `AuthMiddleware, ${roleMiddleware},`
            : `AuthMiddleware,`;


        return `
Router.get(
  "/${sourcePath}/${fieldPath}",
  ${middleware}
  ${handlerName}
);
`;
      })
      .join("\n");


  return `
${importCode}

${routeCode}

module.exports =
  Router;
`;
};


module.exports = {
  GetReferenceFields,
  GetLookupAccessRoles,
  GenerateLookupController,
  GenerateLookupRoutes,
};
