const NormalizeName = (value = "") => {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
};


const IsPluralRelationship = (field = {}) => {
  const name =
    String(field.name || "").toLowerCase();

  const description =
    String(field.description || "")
      .toLowerCase();

  return (
    name.endsWith("s") ||
    description.includes("list of") ||
    description.includes("collection of") ||
    description.includes("multiple ")
  );
};


const NormalizeRoleReferences = (
  specification,
  warnings
) => {
  const roles =
    new Set(
      (specification.roles || []).map(
        (role) =>
          NormalizeName(role)
      )
    );

  const entityNames =
    new Set(
      (specification.entities || []).map(
        (entity) =>
          NormalizeName(entity.name)
      )
    );

  specification.entities =
    (specification.entities || []).map(
      (entity) => ({
        ...entity,

        fields:
          (entity.fields || []).map(
            (field) => {
              if (
                field.type !== "ObjectId" ||
                !field.ref
              ) {
                return field;
              }

              const normalizedRef =
                NormalizeName(
                  field.ref
                );

              /*
               * Valid business entity reference.
               */
              if (
                entityNames.has(
                  normalizedRef
                )
              ) {
                return field;
              }

              /*
               * Example:
               *
               * Appointment.veterinarian
               * ref: "Veterinarian"
               *
               * veterinarian is actually an
               * authenticated User role.
               */
              if (
                roles.has(
                  normalizedRef
                )
              ) {
                warnings.push(
                  `Changed ${entity.name}.${field.name} reference from "${field.ref}" to "User" because "${field.ref}" is an application role rather than a generated entity.`
                );

                return {
                  ...field,

                  ref: "User",

                  referenceFilter:
                    field.referenceFilter || {
                      field: "role",
                      operator: "equals",
                      value: field.ref,
                    },
                };
              }

              warnings.push(
                `Reference ${entity.name}.${field.name} points to "${field.ref}", but no matching generated entity exists.`
              );

              return field;
            }
          ),
      })
    );

  return specification;
};


const AddUserRoleReferenceFilters = (
  specification,
  warnings
) => {
  const roles =
    (specification.roles || []).map(
      (role) => ({
        original: role,
        normalized:
          NormalizeName(role),
      })
    );

  specification.entities =
    (specification.entities || []).map(
      (entity) => ({
        ...entity,

        fields:
          (entity.fields || []).map(
            (field) => {
              if (
                field.type !== "ObjectId" ||
                NormalizeName(field.ref) !==
                  "user" ||
                field.referenceFilter
              ) {
                return field;
              }

              const fieldName =
                NormalizeName(
                  field.name
                );

              const description =
                NormalizeName(
                  field.description
                );

              const matchingRole =
                roles.find(
                  (role) =>
                    fieldName ===
                      role.normalized ||
                    fieldName.includes(
                      role.normalized
                    ) ||
                    description.includes(
                      role.normalized
                    )
                );

              if (!matchingRole) {
                return field;
              }

              warnings.push(
                `Added role filter to ${entity.name}.${field.name}: User.role must equal "${matchingRole.original}".`
              );

              return {
                ...field,

                referenceFilter: {
                  field: "role",
                  operator: "equals",
                  value:
                    matchingRole.original,
                },
              };
            }
          ),
      })
    );

  return specification;
};


const NormalizeInfrastructureUserEntity = (
  specification,
  warnings
) => {
  const hasAuthentication =
    (specification.roles || []).length > 0 ||
    (specification.pages || []).some(
      (page) => page.protected
    ) ||
    (specification.apiModules || []).some(
      (module) => module.protected
    );

  if (!hasAuthentication) {
    return specification;
  }

  const userEntity =
    (specification.entities || []).find(
      (entity) =>
        NormalizeName(entity.name) ===
        "user"
    );

  if (!userEntity) {
    return specification;
  }

  const userFieldNames =
    new Set(
      (userEntity.fields || []).map(
        (field) =>
          NormalizeName(field.name)
      )
    );

  const looksLikeAuthUser =
    userFieldNames.has("email") &&
    (
      userFieldNames.has("password") ||
      userFieldNames.has("role")
    );

  if (!looksLikeAuthUser) {
    return specification;
  }

  specification.entities =
    (specification.entities || []).filter(
      (entity) =>
        NormalizeName(entity.name) !==
        "user"
    );

  warnings.push(
    "Removed duplicate User business entity because authentication is enabled and CoreCraft already generates the infrastructure User model."
  );

  return specification;
};


const AddReferenceDisplayFields = (
  specification,
  warnings
) => {
  const entityMap =
    new Map(
      (specification.entities || [])
        .map((entity) => [
          NormalizeName(entity.name),
          entity,
        ])
    );

  specification.entities =
    (specification.entities || [])
      .map((entity) => ({
        ...entity,

        fields:
          (entity.fields || [])
            .map((field) => {
              if (
                field.type !== "ObjectId" ||
                !field.ref
              ) {
                return field;
              }

              if (
                Array.isArray(
                  field.displayFields
                ) &&
                field.displayFields.length > 0
              ) {
                return field;
              }

              /*
               * User is CoreCraft's
               * infrastructure identity model.
               */
              if (
                NormalizeName(
                  field.ref
                ) === "user"
              ) {
                return {
                  ...field,
                  displayFields: [
                    "name",
                  ],
                };
              }

              const referencedEntity =
                entityMap.get(
                  NormalizeName(
                    field.ref
                  )
                );

              if (!referencedEntity) {
                return field;
              }

              const safePreferredFields = [
                "name",
                "title",
                "code",
                "serialNumber",
                "referenceNumber",
                "number",
                "date",
              ];

              const availableFields =
                new Set(
                  (
                    referencedEntity.fields ||
                    []
                  ).map(
                    (candidate) =>
                      candidate.name
                  )
                );

              const preferred =
                safePreferredFields
                  .filter(
                    (candidate) =>
                      availableFields.has(
                        candidate
                      )
                  )
                  .slice(
                    0,
                    2
                  );

              if (
                preferred.length > 0
              ) {
                return {
                  ...field,
                  displayFields:
                    preferred,
                };
              }

              const sensitiveNames =
                new Set([
                  "password",
                  "token",
                  "secret",
                  "accesstoken",
                  "refreshtoken",
                  "passwordhash",
                ]);

              const fallback =
                (
                  referencedEntity.fields ||
                  []
                ).find(
                  (candidate) =>
                    [
                      "String",
                      "Number",
                      "Date",
                    ].includes(
                      candidate.type
                    ) &&
                    !sensitiveNames.has(
                      NormalizeName(
                        candidate.name
                      )
                    )
                );

              if (fallback) {

                warnings.push(
                  `Selected ${referencedEntity.name}.${fallback.name} as the fallback lookup display field for ${entity.name}.${field.name}.`
                );

                return {
                  ...field,
                  displayFields: [
                    fallback.name,
                  ],
                };
              }

              return field;
            }),
      }));

  return specification;
};


const RemoveSafeDuplicateInverseRelationships = (
  specification,
  warnings
) => {
  const entities =
    specification.entities || [];

  const entityMap =
    new Map();

  entities.forEach((entity) => {
    entityMap.set(
      NormalizeName(entity.name),
      entity
    );
  });


  entities.forEach((entity) => {
    entity.fields =
      (entity.fields || []).filter(
        (field) => {
          if (
            field.type !== "ObjectId" ||
            !field.ref ||
            field.required
          ) {
            return true;
          }

          /*
           * Only consider optional relationship
           * fields that appear to represent a
           * collection.
           *
           * Example:
           *
           * Owner.registeredPets -> Pet
           */
          if (
            !IsPluralRelationship(
              field
            )
          ) {
            return true;
          }

          const referencedEntity =
            entityMap.get(
              NormalizeName(
                field.ref
              )
            );

          if (!referencedEntity) {
            return true;
          }


          /*
           * Check whether the referenced entity
           * already owns the relationship.
           *
           * Example:
           *
           * Pet.owner -> Owner
           */
          const inverseField =
            (
              referencedEntity.fields ||
              []
            ).find(
              (candidate) =>
                candidate.type ===
                  "ObjectId" &&
                NormalizeName(
                  candidate.ref
                ) ===
                  NormalizeName(
                    entity.name
                  )
            );


          if (!inverseField) {
            return true;
          }


          warnings.push(
            `Removed redundant relationship ${entity.name}.${field.name} -> ${field.ref}. The relationship is already represented by ${referencedEntity.name}.${inverseField.name} -> ${entity.name}.`
          );

          return false;
        }
      );
  });


  specification.entities =
    entities;

  return specification;
};


const FindRequiredCircularRelationships = (
  specification,
  warnings
) => {
  const entities =
    specification.entities || [];

  const entityMap =
    new Map();

  entities.forEach((entity) => {
    entityMap.set(
      NormalizeName(entity.name),
      entity
    );
  });


  entities.forEach((entity) => {
    (entity.fields || []).forEach(
      (field) => {
        if (
          field.type !== "ObjectId" ||
          !field.ref ||
          !field.required
        ) {
          return;
        }

        const referencedEntity =
          entityMap.get(
            NormalizeName(
              field.ref
            )
          );

        if (!referencedEntity) {
          return;
        }


        const inverseRequired =
          (
            referencedEntity.fields ||
            []
          ).find(
            (candidate) =>
              candidate.type ===
                "ObjectId" &&
              candidate.required &&
              NormalizeName(
                candidate.ref
              ) ===
                NormalizeName(
                  entity.name
                )
          );


        if (inverseRequired) {
          warnings.push(
            `Potential required circular dependency detected: ${entity.name}.${field.name} requires ${referencedEntity.name}, while ${referencedEntity.name}.${inverseRequired.name} requires ${entity.name}.`
          );
        }
      }
    );
  });


  return specification;
};


const ValidateReferenceIntegrity = (
  specification,
  warnings
) => {
  const validRefs =
    new Set([
      "user",

      ...(specification.entities || [])
        .map(
          (entity) =>
            NormalizeName(
              entity.name
            )
        ),
    ]);


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

          if (
            !validRefs.has(
              NormalizeName(
                field.ref
              )
            )
          ) {
            warnings.push(
              `Unresolved reference: ${entity.name}.${field.name} -> ${field.ref}.`
            );
          }
        });
    });


  return specification;
};


const NormalizeSpecification = (
  inputSpecification = {}
) => {
  /*
   * Clone it so we don't accidentally
   * mutate the original OpenAI response.
   */
  let specification =
    JSON.parse(
      JSON.stringify(
        inputSpecification
      )
    );


  const warnings = [];


  specification =
    NormalizeRoleReferences(
      specification,
      warnings
    );


  specification =
    AddUserRoleReferenceFilters(
      specification,
      warnings
    );


  specification =
    NormalizeInfrastructureUserEntity(
      specification,
      warnings
    );


  specification =
    AddReferenceDisplayFields(
      specification,
      warnings
    );


  specification =
    RemoveSafeDuplicateInverseRelationships(
      specification,
      warnings
    );


  specification =
    FindRequiredCircularRelationships(
      specification,
      warnings
    );


  specification =
    ValidateReferenceIntegrity(
      specification,
      warnings
    );


  return {
    specification,
    warnings:
      [...new Set(warnings)],
  };
};


module.exports = {
  NormalizeSpecification,
};
