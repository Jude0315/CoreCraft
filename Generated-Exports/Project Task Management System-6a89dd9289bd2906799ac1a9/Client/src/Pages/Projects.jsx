import React, {
  useEffect,
  useState,
} from "react";


import {
  useAuth,
} from "../Context/AuthContext";


import API, {
  ProjectApi
} from "../Services/Api";


const Projects = () => {
  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // Stores the records loaded from the backend API.
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);



  const [editingId, setEditingId] =
    useState(null);


  const initialForm = {
    title: "",
    description: "",
    manager: "",
    createdAt: "Date.now",
    dueDate: ""
  };

  // Stores the values currently entered in the create or edit form.
  const [form, setForm] =
    useState(
      initialForm
    );


  const {
    user,
  } = useAuth();



  const [
    managerOptions,
    setManagerOptions
  ] = useState([]);



  const pageActions =
    ["view","create","edit","delete"];

  const roleActions =
    [{"role":"administrator","actions":["view","create","edit","delete"]},{"role":"project manager","actions":["view","create","edit"]}];


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




  const formFields =
    [{"name":"title","type":"String","required":true,"unique":false,"defaultValue":null,"ref":"","referenceFilter":null,"displayFields":["title"],"enumValues":[],"description":"The title of the project."},{"name":"description","type":"String","required":false,"unique":false,"defaultValue":null,"ref":"","referenceFilter":null,"displayFields":[],"enumValues":[],"description":"A brief overview of the project."},{"name":"manager","type":"ObjectId","required":true,"unique":false,"defaultValue":null,"ref":"User","referenceFilter":{"field":"role","operator":"equals","value":"project manager"},"displayFields":["name"],"enumValues":[],"description":"Reference to the project manager overseeing this project."},{"name":"createdAt","type":"Date","required":true,"unique":false,"defaultValue":"Date.now","ref":"","referenceFilter":null,"displayFields":[],"enumValues":[],"description":"Date the project was created."},{"name":"dueDate","type":"Date","required":true,"unique":false,"defaultValue":null,"ref":"","referenceFilter":null,"displayFields":[],"enumValues":[],"description":"Date the project is due."}];


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
          `${field.name} is required.`
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
          `${field.name} must be a valid number.`
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
            `${field.name} must be a valid date.`
          );
        }
      }
    }

    return errors;
  };




  /* -------------------------------------------------------
     Load records
     ------------------------------------------------------- */

  // Loads the existing records when the page opens.
  const LoadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await ProjectApi.getAll();

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




  const LoadReferenceData = async () => {

    // Loads valid options for the manager relationship field.
    // Any referenceFilter from the generated specification is enforced by the backend lookup API.
    try {
      const response =
        await API.get(
          "/lookups/project/manager"
        );

      const items =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setManagerOptions(
        items
      );
    } catch (error) {
      console.error(
        "Failed to load manager lookup:",
        error
      );
    }
  };



  useEffect(() => {
    LoadItems();
    LoadReferenceData();
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




  /* -------------------------------------------------------
     Reset form
     ------------------------------------------------------- */

  const ResetForm = () => {
    setForm(
      initialForm
    );

    setEditingId(null);
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
        editingId
      );

    if (
      validationErrors.length > 0
    ) {
      setError(
        validationErrors[0]
      );

      return;
    }


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


    try {
      // Builds a clean request payload before sending form data to the backend.
      const payload =
        BuildPayload();


      if (editingId) {
        await ProjectApi.update(
          editingId,
          payload
        );

        setSuccess(
          GetSuccessMessage(
            "update"
          )
        );
      } else {
        await ProjectApi.create(
          payload
        );

        setSuccess(
          GetSuccessMessage(
            "create"
          )
        );
      }

      ResetForm();

      await LoadItems();
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




  const HandleCancelEdit = () => {
    setEditingId(
      null
    );

    setForm(
      initialForm
    );
  };




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
      title:
        NormalizeFormValue(
          item.title,
          "String"
        ),
      description:
        NormalizeFormValue(
          item.description,
          "String"
        ),
      manager:
        NormalizeFormValue(
          item.manager,
          "ObjectId"
        ),
      createdAt:
        NormalizeFormValue(
          item.createdAt,
          "Date"
        ),
      dueDate:
        NormalizeFormValue(
          item.dueDate,
          "Date"
        )
    });

    setError("");
    setSuccess("");
  };




  /* -------------------------------------------------------
     Delete
     ------------------------------------------------------- */

  // Sends a delete request for the selected record and refreshes the list afterwards.
  const HandleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this Project?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await ProjectApi.remove(
        id
      );

      setSuccess(
        GetSuccessMessage(
          "delete"
        )
      );

      await LoadItems();
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



  return (
    <main className="page-shell">

      <section className="page-header">

        <span className="eyebrow">
          Project Task Management System
        </span>

        <h1>
          Projects
        </h1>

        <p>
          Manage projects within the system.
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



      {(canCreate || (canEdit && editingId)) && (
        <section className="content-card">

          <div className="card-heading">
            <h2>
              {editingId
              ? "Edit Project"
              : "Create Project"}
            </h2>
          </div>


          <form
            className="entity-form"
            onSubmit={HandleSubmit}
          >


          <div className="form-group">

            <label>
              Title
            </label>

            <input
              type="text"
              id="title"
              name="title"
              value={
                form.title ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            />

            <small>
              The title of the project.
            </small>

          </div>


          <div className="form-group">

            <label>
              Description
            </label>

            <input
              type="text"
              id="description"
              name="description"
              value={
                form.description ||
                ""
              }
              onChange={
                HandleChange
              }
              
            />

            <small>
              A brief overview of the project.
            </small>

          </div>


          <div className="form-group">

            <label htmlFor="manager">
              Manager
            </label>

            <select
              id="manager"
              name="manager"
              value={
                form.manager ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            >

              <option value="">
                Select Manager
              </option>

              {managerOptions.map(
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

            <small>
              Reference to the project manager overseeing this project.
            </small>

          </div>


          <div className="form-group">

            <label>
              Created At
            </label>

            <input
              type="datetime-local"
              id="createdAt"
              name="createdAt"
              value={
                form.createdAt ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            />

            <small>
              Date the project was created.
            </small>

          </div>


          <div className="form-group">

            <label>
              Due Date
            </label>

            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={
                form.dueDate ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            />

            <small>
              Date the project is due.
            </small>

          </div>


            <div className="form-action-row">

              <button
                className="primary-button action-button"
                type="submit"
              >
                {editingId
                ? "Update Project"
                : "Create Project"}
              </button>



            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={HandleCancelEdit}
              >
                Cancel
              </button>
            )}


            </div>

          </form>

        </section>
      )}




      <section className="content-card module-section">

        <div className="card-heading">

          <h2>
            Projects
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

              <th>Title</th>
              <th>Description</th>
              <th>Manager</th>
              <th>Created At</th>
              <th>Due Date</th>

                  {(canEdit || canDelete) && (
                    <th>
                      Actions
                    </th>
                  )}

                </tr>

              </thead>


              <tbody>

                {items.map(
                  (item) => (

                    <tr
                      key={item._id}
                    >

                <td>
                  {GetDisplayValue(
                    item.title,
                    "String",
                    ["title"]
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.description,
                    "String",
                    []
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.manager,
                    "ObjectId",
                    ["name"]
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.createdAt,
                    "Date",
                    []
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.dueDate,
                    "Date",
                    []
                  )}
                </td>

                      {(canEdit || canDelete) && (
                        <td>

                          <div className="row-actions">

                            {canEdit && (
                              <button
                                className="secondary-button"
                                onClick={() =>
                                  HandleEdit(item)
                                }
                              >
                                Edit
                              </button>
                            )}

                            {canDelete && (
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
                            )}

                          </div>

                        </td>
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


    </main>
  );
};


export default Projects;
