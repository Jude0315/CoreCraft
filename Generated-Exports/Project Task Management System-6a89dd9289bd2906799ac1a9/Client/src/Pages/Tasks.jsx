import React, {
  useEffect,
  useState,
} from "react";


import {
  useAuth,
} from "../Context/AuthContext";


import API, {
  TaskApi
} from "../Services/Api";


const Tasks = () => {
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
    priority: "",
    status: "pending",
    project: "",
    assignedTo: ""
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
    projectOptions,
    setProjectOptions
  ] = useState([]);

  const [
    assignedToOptions,
    setAssignedToOptions
  ] = useState([]);



  const pageActions =
    ["view","create","edit"];

  const roleActions =
    [{"role":"administrator","actions":["view","create","edit"]},{"role":"project manager","actions":["view","create","edit"]},{"role":"team member","actions":["view","edit"]}];


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
    [{"name":"title","type":"String","required":true,"unique":false,"defaultValue":null,"ref":"","referenceFilter":null,"displayFields":["title"],"enumValues":[],"description":"The title of the task."},{"name":"priority","type":"String","required":true,"unique":false,"defaultValue":null,"ref":"","referenceFilter":null,"displayFields":[],"enumValues":["low","medium","high"],"description":"The priority level of the task."},{"name":"status","type":"String","required":true,"unique":false,"defaultValue":"pending","ref":"","referenceFilter":null,"displayFields":[],"enumValues":["pending","in progress","completed"],"description":"Current status of the task."},{"name":"project","type":"ObjectId","required":true,"unique":false,"defaultValue":null,"ref":"Project","referenceFilter":null,"displayFields":["title"],"enumValues":[],"description":"Reference to the project this task belongs to."},{"name":"assignedTo","type":"ObjectId","required":true,"unique":false,"defaultValue":null,"ref":"User","referenceFilter":{"field":"role","operator":"equals","value":"team member"},"displayFields":["name"],"enumValues":[],"description":"The user assigned to this task."}];


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
        await TaskApi.getAll();

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

    // Loads valid options for the project relationship field.
    // Any referenceFilter from the generated specification is enforced by the backend lookup API.
    try {
      const response =
        await API.get(
          "/lookups/task/project"
        );

      const items =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setProjectOptions(
        items
      );
    } catch (error) {
      console.error(
        "Failed to load project lookup:",
        error
      );
    }

    // Loads valid options for the assignedTo relationship field.
    // Any referenceFilter from the generated specification is enforced by the backend lookup API.
    try {
      const response =
        await API.get(
          "/lookups/task/assignedTo"
        );

      const items =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setAssignedToOptions(
        items
      );
    } catch (error) {
      console.error(
        "Failed to load assignedTo lookup:",
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
        await TaskApi.update(
          editingId,
          payload
        );

        setSuccess(
          GetSuccessMessage(
            "update"
          )
        );
      } else {
        await TaskApi.create(
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
      priority:
        NormalizeFormValue(
          item.priority,
          "String"
        ),
      status:
        NormalizeFormValue(
          item.status,
          "String"
        ),
      project:
        NormalizeFormValue(
          item.project,
          "ObjectId"
        ),
      assignedTo:
        NormalizeFormValue(
          item.assignedTo,
          "ObjectId"
        )
    });

    setError("");
    setSuccess("");
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
          Tasks
        </h1>

        <p>
          Manage tasks assigned to users and view task-related information.
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
              ? "Edit Task"
              : "Create Task"}
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
              The title of the task.
            </small>

          </div>


          <div className="form-group">

            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
              name="priority"
              value={
                form.priority ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            >

              <option value="">
                Select Priority
              </option>

              <option value="low">
                low
              </option>
              <option value="medium">
                medium
              </option>
              <option value="high">
                high
              </option>

            </select>

            <small>
              The priority level of the task.
            </small>

          </div>


          <div className="form-group">

            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={
                form.status ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            >

              <option value="">
                Select Status
              </option>

              <option value="pending">
                pending
              </option>
              <option value="in progress">
                in progress
              </option>
              <option value="completed">
                completed
              </option>

            </select>

            <small>
              Current status of the task.
            </small>

          </div>


          <div className="form-group">

            <label htmlFor="project">
              Project
            </label>

            <select
              id="project"
              name="project"
              value={
                form.project ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            >

              <option value="">
                Select Project
              </option>

              {projectOptions.map(
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
              Reference to the project this task belongs to.
            </small>

          </div>


          <div className="form-group">

            <label htmlFor="assignedTo">
              Assigned To
            </label>

            <select
              id="assignedTo"
              name="assignedTo"
              value={
                form.assignedTo ||
                ""
              }
              onChange={
                HandleChange
              }
              required
            >

              <option value="">
                Select Assigned To
              </option>

              {assignedToOptions.map(
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
              The user assigned to this task.
            </small>

          </div>


            <div className="form-action-row">

              <button
                className="primary-button action-button"
                type="submit"
              >
                {editingId
                ? "Update Task"
                : "Create Task"}
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
            Tasks
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
              <th>Priority</th>
              <th>Status</th>
              <th>Project</th>
              <th>Assigned To</th>

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
                    item.priority,
                    "String",
                    []
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.status,
                    "String",
                    []
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.project,
                    "ObjectId",
                    ["title"]
                  )}
                </td>
                <td>
                  {GetDisplayValue(
                    item.assignedTo,
                    "ObjectId",
                    ["name"]
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


export default Tasks;
