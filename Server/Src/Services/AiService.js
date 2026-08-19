const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GenerateAiResponse = async (session) => {
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

  const prompt = `
You are CoreCraft's AI requirement assistant.

Current session:
App Type: ${session.appType || "Not detected"}
Current Step: ${session.currentStep || "initial"}
Selected Features: ${session.features?.join(", ") || "None"}
Removed Features: ${session.removedFeatures?.join(", ") || "None"}
Pending Suggestions: ${session.suggestions?.join(", ") || "None"}

Task:
Ask ONE short, useful follow-up question to refine the software requirements.
Do not generate code yet.
`;

  const response = await client.responses.create({
    model,
    input: prompt,
  });

  return response.output_text;
};


/*---------------------------------------------------------------------------------- */
const ExtractRequirementsFromMessage = async (message, session) => {
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

  const prompt = `
You are CoreCraft's AI requirement extraction engine.

Extract structured software requirements from the user's message.

Current session:
App Type: ${session.appType || "Not detected"}
Existing Features: ${session.features?.join(", ") || "None"}
Existing Requirements: ${session.requirements?.join(", ") || "None"}

User message:
"${message}"

Return ONLY valid JSON in this exact format:
{
  "featuresToAdd": [],
  "requirementsToAdd": []
}

Rules:
- featuresToAdd should contain short feature names only.
- requirementsToAdd should contain clear functional requirements.
- Do not include explanations.
- Do not include markdown.
`;

  const response = await client.responses.create({
    model,
    input: prompt,
  });

  const text = response.output_text;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      featuresToAdd: [],
      requirementsToAdd: [],
    };
  }
};
/*--------------------------------------------------------------------------------- */
const GenerateRequirementSummary = async (session) => {
  const prompt = `
You are CoreCraft's software requirements analyst.

Read the requirement session and write a clear human-readable summary.

CURRENT APP TYPE:

${session.appType || "Not yet classified"}


SELECTED FEATURES:

${JSON.stringify(session.features || [])}


DETAILED REQUIREMENTS:

${JSON.stringify(session.requirements || [])}


CONVERSATION:

${JSON.stringify(session.messages || [])}


Create a clear requirement summary containing:


1. Application purpose


Explain what the user is trying to build.


2. Main users or roles


Identify users mentioned or clearly implied by the conversation.


3. Core capabilities


Describe the major functionality requested.


4. Important domain data


Mention important objects or information that the application needs to manage.


5. Key relationships or workflows


Briefly explain important relationships between the concepts.


Example:


Machines belong to sites.


Technicians create inspection records.


Managers approve maintenance jobs.


STYLE:


- Clear
- Professional
- Beginner friendly
- Technically useful
- Around 3-6 short paragraphs
- No unnecessary assumptions
- No markdown headings
- Do not complain about missing appType
- Do not say requirements are undefined when the conversation contains requirements


Return only the summary text.
`;

  const response =
    await client.responses.create({
      model:
        process.env.OPENAI_MODEL ||
        "gpt-4o-mini",

      input: prompt,
    });

  return response.output_text.trim();
};

/*------------------------------------------------------------------------------------ */
const GenerateDynamicApplicationSpecification =
  async (session) => {
    const model =
      process.env.OPENAI_MODEL ||
      "gpt-4o-mini";

    const prompt = `
You are the dynamic software architecture engine for CoreCraft.

CORECRAFT PURPOSE
CoreCraft is a MERN starter-project generator.

The user can describe ANY MERN application idea in natural language.

Examples:
- clinic appointment system
- vehicle rental system
- employee leave management system
- gym management system
- inventory tracker
- event booking platform
- research project tracker
- restaurant reservation system
- complaint management system
- custom business application

Do NOT limit yourself to predefined application categories.

Your job is to understand the user's requirements and design the CORE FOUNDATION
of the MERN application so that CoreCraft can automatically generate a runnable
starter project.

The generated project is NOT expected to be a complete commercial application.

It should provide:
- sensible project structure
- database models
- core relationships
- REST API modules
- frontend pages
- authentication where required
- role-based access where required
- reusable CRUD foundations
- clear code comments
- beginner-friendly documentation
- clear places where the developer can continue development


==================================================
1. UNDERSTAND THE APPLICATION
==================================================

First understand what the user is actually trying to build.

Do not force the application into categories such as:
LMS, Ecommerce, Blog, Portfolio, etc.

Infer the application dynamically from the user's description.

Determine:

- application purpose
- important users
- user roles
- main entities
- entity relationships
- core workflows
- pages required
- backend API modules
- authentication requirements
- authorization requirements


==================================================
2. DESIGN ONLY THE CORE FOUNDATION
==================================================

CoreCraft is a quick-start development tool.

Do NOT attempt to generate every advanced feature imaginable.

Focus on the minimum useful architecture that gives the developer
a strong starting point.

For example:

If the user asks for a hospital appointment application,
the core foundation may include:

User
Doctor
Patient
Appointment

Do not automatically add:
billing,
insurance,
pharmacy,
laboratory,
analytics,
AI diagnosis,
notifications,

unless the user specifically asks for them.


==================================================
3. GENERATE ENTITIES DYNAMICALLY
==================================================

Entities must be inferred from the user's requirements.

Never assume fixed entities.

Examples of possible entities:

Vehicle
Booking
Employee
LeaveRequest
Doctor
Patient
Appointment
Machine
Inspection
Event
Ticket
Restaurant
Reservation

Any valid domain entity is allowed.

Entity names must:

- be singular
- use PascalCase
- clearly represent the domain object


==================================================
4. GENERATE FIELDS DYNAMICALLY
==================================================

Each entity must contain sensible fields.

Supported field types:

String
Number
Boolean
Date
ObjectId
Mixed

When one entity references another entity:

Use:

"type": "ObjectId"

and:

"ref": "ReferencedEntityName"

Example:

{
  "name": "doctor",
  "type": "ObjectId",
  "required": true,
  "unique": false,
  "defaultValue": null,
  "ref": "Doctor",
  "referenceFilter": null,
  "displayFields": ["name"],
  "enumValues": []
}

For ObjectId relationship fields, optionally include referenceFilter
when the referenced records must satisfy a condition.

referenceFilter format:

{
  "field": "fieldName",
  "operator": "equals | notEquals | in | notIn",
  "value": any
}

Use referenceFilter only when the user's requirements imply that
only a subset of the referenced entity should be selectable.

Do not invent filters unnecessarily.

Example concept:
If an ObjectId references User but semantically refers to users
with one particular application role, reference User and express
the role restriction using referenceFilter.

Do not hardcode domain-specific entity or role names.

For ObjectId relationship fields, include displayFields.

displayFields must contain one or more safe, human-readable fields
from the referenced entity that can identify a record in a selection control.

Examples of suitable fields include:
name, title, code, serialNumber, referenceNumber, date, number.

Only choose fields that actually exist on the referenced entity.

Do not use sensitive fields such as passwords, tokens, secrets,
authentication credentials, or private security information.

If the referenced model is User, prefer safe identity fields such as name.

Do not invent domain-specific fields.

Example structure:

{
  "name": "relatedRecord",
  "type": "ObjectId",
  "ref": "SomeEntity",
  "referenceFilter": null,
  "displayFields": ["name"]
}

Use enumValues only when the values are clearly limited.

Example:

{
  "name": "status",
  "type": "String",
  "required": true,
  "unique": false,
  "defaultValue": "pending",
  "ref": "",
  "enumValues": [
    "pending",
    "approved",
    "rejected"
  ]
}


==================================================
5. AUTHENTICATION
==================================================

Only include User and authentication when the application
actually needs user accounts.

If authentication is needed, User may contain fields such as:

name
email
password
role

Do not expose password information on frontend pages.

Roles must be inferred dynamically.

Examples:

admin
customer
employee
manager
doctor
patient
technician
receptionist

Do not automatically use student/instructor unless the
application actually needs those roles.


==================================================
6. PAGES
==================================================

Generate pages according to actual workflows.

Page types may include:

list
detail
form
dashboard
auth
crud

Example:

{
  "name": "Appointments",
  "route": "/appointments",
  "type": "crud",
  "entity": "Appointment",
  "protected": true,
  "roles": [
    "doctor",
    "receptionist",
    "admin"
  ],
  "actions": [
    "view",
    "create",
    "edit",
    "delete"
  ]
}

Do NOT generate unnecessary pages simply because an entity exists.


==================================================
7. API MODULES
==================================================

Create backend modules based on actual application requirements.

Possible operations:

create
read
update
delete

Example:

{
  "name": "Appointment API",
  "entity": "Appointment",
  "operations": [
    "create",
    "read",
    "update",
    "delete"
  ],
  "protected": true,
  "roles": [
    "doctor",
    "receptionist",
    "admin"
  ]
}


==================================================
8. GENERATED CODE DOCUMENTATION
==================================================

CoreCraft is designed to help developers continue coding
after generation.

Therefore the generated specification must include documentation
instructions.

The generated source code should contain SIMPLE, USEFUL COMMENTS.

Comments should explain:

- what the file is responsible for
- what important functions do
- how models relate to each other
- where API routes are registered
- where authentication is applied
- where the developer can add additional business logic

Comments should NOT explain obvious JavaScript syntax line-by-line.

Good comment example:

// Handles CRUD operations for Appointment records.
// Add application-specific booking rules here if needed.

Bad comment example:

// Declare a variable called appointment.


==================================================
9. README / BEGINNER GUIDE
==================================================

The generated project should include beginner-friendly documentation.

The documentation should explain:

1. What the generated application is

2. Generated technology stack

3. Folder structure

4. What each important folder contains

Example:

Client/src/Pages
Contains the generated React pages.

Server/Src/Models
Contains Mongoose database schemas.

Server/Src/Controllers
Contains backend request handling logic.

Server/Src/Routes
Defines REST API endpoints.


5. How the frontend and backend communicate

Explain simply:

React Page
→ API Service
→ Express Route
→ Controller
→ Mongoose Model
→ MongoDB


6. How to run the project

Example:

Server:

npm install
npm run dev

Client:

npm install
npm run dev


7. Environment variables required

Explain each variable.

Example:

PORT
Port used by the generated backend.

MONGO_URI
MongoDB connection address.

JWT_SECRET
Secret used for authentication tokens.

VITE_API_URL
Frontend address used to communicate with the backend.


8. Important generated files

Explain which files developers are most likely to modify.


9. Suggested next development steps

Provide practical suggestions based on the user's application.

Examples:

- add validation
- improve UI
- add business rules
- add search/filtering
- add file upload
- add notifications

Only recommend things relevant to the generated application.


==================================================
10. CODE COMMENTS STYLE
==================================================

Generated comments and documentation must be:

- short
- clear
- beginner friendly
- technically correct
- useful to someone opening the project for the first time

Avoid:

- excessive comments
- academic explanations
- unnecessary theory
- giant comment blocks inside source code


==================================================
APPLICATION INFORMATION
==================================================

Application Type:
${session.appType || "Not predefined"}

Requirement Summary:
${session.requirementSummary || ""}

Selected Features:
${JSON.stringify(session.features || [])}

Detailed Requirements:
${JSON.stringify(session.requirements || [])}

Conversation:
${JSON.stringify(session.messages || [])}


==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not wrap the response in triple backticks.

Do not include explanations outside the JSON.

Use this exact structure:

{
  "applicationName": "string",

  "description": "short explanation of the generated application",

  "appType": "dynamically inferred application type",

  "stack": "MERN",

  "roles": [
    "string"
  ],

  "entities": [
    {
      "name": "string",

      "description": "short beginner-friendly explanation of what this entity represents",

      "fields": [
        {
          "name": "fieldName",
          "type": "ObjectId",
          "required": true,
          "unique": false,
          "defaultValue": null,
          "ref": "SomeEntity",
          "referenceFilter": null,
          "displayFields": ["name"],
          "enumValues": [],

          "description": "short explanation of what this field stores"
        }
      ]
    }
  ],

  "pages": [
    {
      "name": "string",
      "route": "/route",
      "type": "list | detail | form | dashboard | auth | crud",
      "entity": "string",
      "protected": true,
      "roles": [],
      "actions": [],

      "description": "short explanation of the purpose of this page"
    }
  ],

  "apiModules": [
    {
      "name": "string",
      "entity": "string",
      "operations": [],
      "protected": true,
      "roles": [],

      "description": "short explanation of what this API module manages"
    }
  ],

  "documentation": {
    "overview": "simple explanation of what the generated project does",

    "architectureExplanation":
      "simple explanation of how React, Express, MongoDB and the generated API layers work together",

    "importantFiles": [
      {
        "path": "string",
        "purpose": "simple explanation"
      }
    ],

    "nextSteps": [
      "practical developer suggestion"
    ]
  }
}


==================================================
FINAL VALIDATION RULES
==================================================

Before returning the JSON, check:

- entities match the user's actual domain
- fields are realistic
- relationships use ObjectId correctly
- referenceFilter is used only for implied subset relationships
- displayFields use safe identifying fields from the referenced entity
- roles are relevant
- pages support actual workflows
- API modules correspond to required backend operations
- no unnecessary application-specific assumptions were introduced
- documentation is beginner friendly
- no predefined application template was forced onto the user's request

Return only the final JSON.
`;

    const response =
      await client.responses.create({
        model,
        input: prompt,
      });

    let output =
      response.output_text.trim();

    output = output
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    try {
      return JSON.parse(output);
    } catch (error) {
      console.error(
        "Dynamic specification JSON:",
        output
      );

      throw new Error(
        "AI returned an invalid generation specification"
      );
    }
  };

/*------------------------------------------------------------------------------------ */
module.exports = {
  GenerateAiResponse,
  ExtractRequirementsFromMessage,
  GenerateRequirementSummary,
  GenerateDynamicApplicationSpecification,
};
