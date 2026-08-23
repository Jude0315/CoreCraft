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


const FindMatchingRoleForUserReference = (
  field,
  roles
) => {
  const searchableText =
    [
      field?.name,
      field?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const normalizedSearchableText =
    NormalizeName(
      searchableText
    );

  const sortedRoles =
    [...(roles || [])]
      .sort(
        (a, b) =>
          String(b).length -
          String(a).length
      );

  return (
    sortedRoles.find((role) => {
      const roleText =
        String(role)
          .toLowerCase();

      const normalizedRole =
        NormalizeName(role);

      return (
        searchableText.includes(
          roleText
        ) ||
        normalizedSearchableText.includes(
          normalizedRole
        )
      );
    }) ||
    null
  );
};


const AddUserRoleReferenceFilters = (
  specification,
  warnings
) => {
  const roles =
    specification.roles || [];

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

              const matchingRole =
                FindMatchingRoleForUserReference(
                  field,
                  roles
                );

              if (!matchingRole) {
                return field;
              }

              warnings.push(
                `Added User role filter "${matchingRole}" to ${entity.name}.${field.name}.`
              );

              return {
                ...field,

                referenceFilter: {
                  field: "role",
                  operator: "equals",
                  value:
                    matchingRole,
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

  const hasUserEntity =
    (specification.entities || []).some(
      (entity) =>
        NormalizeName(
          entity.name
        ) === "user"
    );

  if (!hasUserEntity) {
    return specification;
  }

  specification.entities =
    (specification.entities || []).filter(
      (entity) =>
        NormalizeName(
          entity.name
        ) !== "user"
    );

  warnings.push(
    "Removed User from business entities because authentication is enabled and User is provided by CoreCraft authentication infrastructure."
  );

  return specification;
};


const NormalizePageEntityReferences = (
  specification,
  warnings
) => {
  const validEntities =
    new Set(
      (specification.entities || [])
        .map(
          (entity) =>
            NormalizeName(
              entity.name
            )
        )
    );

  /*
   * User may be supplied by the
   * authentication infrastructure.
   */
  const hasAuthentication =
    (specification.roles || []).length > 0 ||
    (specification.pages || []).some(
      (page) => page.protected
    ) ||
    (specification.apiModules || []).some(
      (module) => module.protected
    );

  if (hasAuthentication) {
    validEntities.add("user");
  }

  specification.pages =
    (specification.pages || [])
      .map((page) => {
        if (!page.entity) {
          return page;
        }

        const normalizedEntity =
          NormalizeName(
            page.entity
          );

        if (
          validEntities.has(
            normalizedEntity
          )
        ) {
          return page;
        }

        /*
         * A dashboard/summary page can exist
         * without being backed by one entity.
         */
        if (
          page.type === "dashboard"
        ) {
          warnings.push(
            `Removed invalid entity "${page.entity}" from dashboard page "${page.name}" because no matching entity or infrastructure model exists.`
          );

          return {
            ...page,
            entity: "",
          };
        }

        warnings.push(
          `Removed invalid entity "${page.entity}" from page "${page.name}" because no matching entity or infrastructure model exists.`
        );

        return {
          ...page,
          entity: "",
        };
      });

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


const NormalizeRoleActions = (
  specification,
  warnings
) => {
  const NormalizePageAction = (
    action
  ) => {
    switch (
      String(action)
        .toLowerCase()
    ) {
      case "read":
        return "view";

      case "update":
        return "edit";

      default:
        return String(action)
          .toLowerCase();
    }
  };

  const NormalizeApiAction = (
    action
  ) => {
    switch (
      String(action)
        .toLowerCase()
    ) {
      case "view":
        return "read";

      case "edit":
        return "update";

      default:
        return String(action)
          .toLowerCase();
    }
  };

  const NormalizeEntries = (
    container,
    supportedActions,
    normalizeAction
  ) => {
    const roles =
      Array.isArray(container.roles)
        ? container.roles
        : [];

    const actions =
      Array.isArray(
        supportedActions
      )
        ? [
            ...new Set(
              supportedActions.map(
                normalizeAction
              )
            ),
          ]
        : [];

    if (
      !Array.isArray(
        container.roleActions
      )
    ) {
      container.roleActions = [];

      return container;
    }

    container.roleActions =
      container.roleActions
        .filter((entry) => {
          if (
            !entry ||
            !roles.includes(
              entry.role
            )
          ) {
            warnings.push(
              `Removed invalid roleActions entry for role "${entry?.role || ""}".`
            );

            return false;
          }

          return true;
        })
        .map((entry) => ({
          role:
            entry.role,

          actions:
            [
              ...new Set(
                (
                  Array.isArray(
                    entry.actions
                  )
                    ? entry.actions
                    : []
                )
                  .map((action) =>
                    normalizeAction(
                      action
                    )
                  )
                  .filter(
                    (action) =>
                    actions.includes(
                      action
                    )
                  )
              ),
            ],
        }))
        .filter((entry) => {
          if (
            entry.actions.length === 0
          ) {
            warnings.push(
              `Removed empty roleActions entry for role "${entry.role}".`
            );

            return false;
          }

          return true;
        });

    return container;
  };

  specification.pages =
    (specification.pages || [])
      .map((page) => {
        page.actions =
          [
            ...new Set(
              (page.actions || [])
                .map(
                  NormalizePageAction
                )
                .filter(
                  (action) =>
                    [
                      "view",
                      "create",
                      "edit",
                      "delete",
                    ].includes(
                      action
                    )
                )
            ),
          ];

        return NormalizeEntries(
          page,
          page.actions || [],
          NormalizePageAction
        );
      });

  specification.apiModules =
    (specification.apiModules || [])
      .map((apiModule) => {
        apiModule.operations =
          [
            ...new Set(
              (
                apiModule.operations ||
                []
              )
                .map(
                  NormalizeApiAction
                )
                .filter(
                  (operation) =>
                    [
                      "read",
                      "create",
                      "update",
                      "delete",
                    ].includes(
                      operation
                    )
                )
            ),
          ];

        return NormalizeEntries(
          apiModule,
          apiModule.operations || [],
          NormalizeApiAction
        );
      });

  return specification;
};


const PageActionToApiOperation = (
  action
) => {
  const map = {
    view: "read",
    create: "create",
    edit: "update",
    delete: "delete",
  };

  return map[action] || null;
};


const FindApiModuleForEntity = (
  specification,
  entityName
) => {
  return (
    specification.apiModules || []
  ).find(
    (apiModule) =>
      NormalizeName(
        apiModule.entity
      ) ===
      NormalizeName(
        entityName
      )
  );
};


const GetAllowedApiOperationsForRole = (
  apiModule,
  role
) => {
  if (!apiModule) {
    return [];
  }

  const roleActions =
    apiModule.roleActions || [];

  if (
    roleActions.length > 0
  ) {
    const match =
      roleActions.find(
        (item) =>
          NormalizeName(
            item.role
          ) ===
          NormalizeName(
            role
          )
      );

    return (
      match?.actions || []
    );
  }

  const roleAllowed =
    (
      apiModule.roles || []
    ).some(
      (item) =>
        NormalizeName(item) ===
        NormalizeName(role)
    );

  return roleAllowed
    ? apiModule.operations || []
    : [];
};


const SynchronizePageAndApiPermissions = (
  specification,
  warnings = []
) => {
  const pages =
    specification.pages || [];

  for (const page of pages) {
    /*
     * Dashboard and non-entity pages do not need
     * CRUD permission synchronization.
     */
    if (
      !page.entity ||
      page.type === "dashboard"
    ) {
      continue;
    }

    const apiModule =
      FindApiModuleForEntity(
        specification,
        page.entity
      );

    if (!apiModule) {
      continue;
    }

    const normalizedRoleActions = [];

    for (
      const roleEntry of
      page.roleActions || []
    ) {
      const allowedApiOperations =
        GetAllowedApiOperationsForRole(
          apiModule,
          roleEntry.role
        );

      const safePageActions =
        (
          roleEntry.actions || []
        ).filter((pageAction) => {
          const requiredOperation =
            PageActionToApiOperation(
              pageAction
            );

          if (!requiredOperation) {
            return false;
          }

          const allowed =
            allowedApiOperations.includes(
              requiredOperation
            );

          if (!allowed) {
            warnings.push(
              `Removed page action "${pageAction}" from role "${roleEntry.role}" on page "${page.name}" because the matching API does not allow "${requiredOperation}".`
            );
          }

          return allowed;
        });

      if (
        safePageActions.length > 0
      ) {
        normalizedRoleActions.push({
          role:
            roleEntry.role,

          actions:
            safePageActions,
        });
      }
    }

    page.roleActions =
      normalizedRoleActions;

    /*
     * Rebuild the page-wide actions list from
     * all role-specific permissions.
     */
    page.actions =
      [
        ...new Set(
          normalizedRoleActions
            .flatMap(
              (entry) =>
                entry.actions || []
            )
        ),
      ];
  }

  return specification;
};


const HexToRgb = (
  hex
) => {
  const normalized =
    String(hex || "")
      .replace("#", "");

  if (
    normalized.length !== 6
  ) {
    return null;
  }

  return {
    r:
      parseInt(
        normalized.slice(0, 2),
        16
      ),

    g:
      parseInt(
        normalized.slice(2, 4),
        16
      ),

    b:
      parseInt(
        normalized.slice(4, 6),
        16
      ),
  };
};


const GetBrightness = (
  hex
) => {
  const rgb =
    HexToRgb(
      hex
    );

  if (!rgb) {
    return 255;
  }

  return (
    rgb.r * 299 +
    rgb.g * 587 +
    rgb.b * 114
  ) / 1000;
};


const GetReadableTextColor = (
  background
) => {
  return (
    GetBrightness(
      background
    ) > 160
  )
    ? "#111827"
    : "#f9fafb";
};


const NormalizeUiSpecification = (
  specification,
  warnings
) => {
  const ui =
    specification.ui || {};

  const isHexColor = (value) =>
    typeof value === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(
      value
    );

  const isCssSize = (value) =>
    typeof value === "string" &&
    /^(\d+(\.\d+)?)(px|rem|em|%|vw|vh)$/.test(
      value
    );

  const safeColor = (
    value,
    fallback
  ) =>
    isHexColor(value)
      ? value
      : fallback;

  const safeSize = (
    value,
    fallback
  ) =>
    isCssSize(value)
      ? value
      : fallback;

  const safeEnum = (
    value,
    allowed,
    fallback
  ) =>
    allowed.includes(value)
      ? value
      : fallback;

  const safeNumber = (
    value,
    fallback,
    min,
    max
  ) => {
    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue
      ) &&
      numericValue >= min &&
      numericValue <= max
    ) {
      return numericValue;
    }

    return fallback;
  };

  const safeShadow =
    typeof ui.cardShadow === "string" &&
    ui.cardShadow.trim()
      ? ui.cardShadow
      : "0 10px 30px rgba(15, 23, 42, 0.08)";

  const primary =
    safeColor(
      ui.colors?.primary,
      "#2563eb"
    );

  const background =
    safeColor(
      ui.colors?.background,
      "#f8fafc"
    );

  const surface =
    safeColor(
      ui.colors?.surface,
      "#ffffff"
    );

  const safeOpacity = (
    value,
    fallback
  ) => {
    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue
      ) &&
      numericValue >= 0 &&
      numericValue <= 1
    ) {
      return numericValue;
    }

    return fallback;
  };

  const normalizedColors = {
    primary:
      primary,

    primaryText:
      safeColor(
        ui.colors?.primaryText,
        GetReadableTextColor(
          primary
        )
      ),

    secondary:
      safeColor(
        ui.colors?.secondary,
        "#64748b"
      ),

    background:
      background,

    surface:
      surface,

    surfaceText:
      safeColor(
        ui.colors?.surfaceText,
        GetReadableTextColor(
          surface
        )
      ),

    text:
      safeColor(
        ui.colors?.text,
        GetReadableTextColor(
          background
        )
      ),

    mutedText:
      safeColor(
        ui.colors?.mutedText,
        "#64748b"
      ),

    border:
      safeColor(
        ui.colors?.border,
        "#e2e8f0"
      ),

    danger:
      safeColor(
        ui.colors?.danger,
        "#dc2626"
      ),

    success:
      safeColor(
        ui.colors?.success,
        "#16a34a"
      ),
  };

  const auth =
    ui.auth || {};

  const normalizedAuth = {
    formPosition:
      safeEnum(
        auth.formPosition,
        [
          "left",
          "right",
          "center",
        ],
        "right"
      ),

    contentAlignment:
      safeEnum(
        auth.contentAlignment,
        [
          "start",
          "center",
          "end",
        ],
        "center"
      ),

    background: {
      type:
        safeEnum(
          auth.background?.type,
          [
            "solid",
            "gradient",
            "radial",
            "mesh",
            "pattern",
          ],
          "gradient"
        ),

      primary:
        safeColor(
          auth.background?.primary,
          normalizedColors.background
        ),

      secondary:
        safeColor(
          auth.background?.secondary,
          normalizedColors.primary
        ),

      accent:
        safeColor(
          auth.background?.accent,
          normalizedColors.primary
        ),

      direction:
        typeof auth.background
          ?.direction === "string" &&
        auth.background.direction.trim()
          ? auth.background.direction
          : "135deg",
    },

    panel: {
      style:
        safeEnum(
          auth.panel?.style,
          [
            "solid",
            "glass",
            "bordered",
            "minimal",
          ],
          "solid"
        ),

      width:
        safeSize(
          auth.panel?.width,
          "420px"
        ),

      opacity:
        safeOpacity(
          auth.panel?.opacity,
          1
        ),

      padding:
        safeSize(
          auth.panel?.padding,
          "32px"
        ),
    },

    branding: {
      show:
        typeof auth.branding?.show ===
        "boolean"
          ? auth.branding.show
          : true,

      position:
        safeEnum(
          auth.branding?.position,
          [
            "left",
            "right",
            "top",
            "none",
          ],
          "left"
        ),

      showDescription:
        typeof auth.branding
          ?.showDescription ===
        "boolean"
          ? auth.branding.showDescription
          : true,

      alignment:
        safeEnum(
          auth.branding?.alignment,
          [
            "left",
            "center",
            "right",
          ],
          "left"
        ),
    },

    decoration: {
      type:
        safeEnum(
          auth.decoration?.type,
          [
            "none",
            "glow",
            "grid",
            "orbs",
            "lines",
          ],
          "none"
        ),

      intensity:
        safeEnum(
          auth.decoration?.intensity,
          [
            "subtle",
            "medium",
            "strong",
          ],
          "subtle"
        ),
    },
  };

  specification.ui = {
    ...ui,

    theme:
      safeEnum(
        ui.theme,
        [
          "modern",
          "minimal",
          "corporate",
          "bold",
          "elegant",
        ],
        "modern"
      ),

    style:
      safeEnum(
        ui.style,
        [
          "professional",
          "clean",
          "friendly",
          "technical",
          "premium",
        ],
        "professional"
      ),

    colors:
      normalizedColors,

    spacing: {
      xs:
        safeSize(
          ui.spacing?.xs,
          "6px"
        ),

      sm:
        safeSize(
          ui.spacing?.sm,
          "10px"
        ),

      md:
        safeSize(
          ui.spacing?.md,
          "16px"
        ),

      lg:
        safeSize(
          ui.spacing?.lg,
          "24px"
        ),

      xl:
        safeSize(
          ui.spacing?.xl,
          "32px"
        ),
    },

    radius: {
      input:
        safeSize(
          ui.radius?.input,
          "10px"
        ),

      card:
        safeSize(
          ui.radius?.card,
          "12px"
        ),

      button:
        safeSize(
          ui.radius?.button,
          "10px"
        ),
    },

    layout: {
      navigation:
        safeEnum(
          ui.layout?.navigation,
          [
            "sidebar",
            "topbar",
            "hybrid",
          ],
          "sidebar"
        ),

      sidebarWidth:
        safeSize(
          ui.layout?.sidebarWidth,
          "250px"
        ),

      headerHeight:
        safeSize(
          ui.layout?.headerHeight,
          "68px"
        ),

      pageMaxWidth:
        safeSize(
          ui.layout?.pageMaxWidth,
          "1400px"
        ),
    },

    cardShadow:
      safeShadow,

    auth:
      normalizedAuth,

    fontStyle:
      safeEnum(
        ui.fontStyle,
        [
          "modern",
          "classic",
          "technical",
          "elegant",
        ],
        "modern"
      ),

    headingWeight:
      safeNumber(
        ui.headingWeight,
        700,
        500,
        900
      ),

    bodyWeight:
      safeNumber(
        ui.bodyWeight,
        400,
        300,
        600
      ),

    cardStyle:
      safeEnum(
        ui.cardStyle,
        [
          "flat",
          "bordered",
          "elevated",
        ],
        "elevated"
      ),

    buttonStyle:
      safeEnum(
        ui.buttonStyle,
        [
          "square",
          "soft",
          "rounded",
          "pill",
        ],
        "rounded"
      ),

    tableStyle:
      safeEnum(
        ui.tableStyle,
        [
          "minimal",
          "clean",
          "striped",
          "bordered",
        ],
        "clean"
      ),

    formStyle:
      safeEnum(
        ui.formStyle,
        [
          "stacked",
          "compact",
          "two-column",
        ],
        "stacked"
      ),

    visualDensity:
      safeEnum(
        ui.visualDensity,
        [
          "compact",
          "comfortable",
          "spacious",
        ],
        "comfortable"
      ),
  };

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
    NormalizePageEntityReferences(
      specification,
      warnings
    );


  specification =
    NormalizeRoleActions(
      specification,
      warnings
    );


  specification =
    SynchronizePageAndApiPermissions(
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
    NormalizeUiSpecification(
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
