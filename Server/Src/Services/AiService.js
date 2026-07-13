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
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

  const prompt = `
You are CoreCraft's software requirements analyst.

Create a clear final software requirement summary from the structured session data below.

Application Type:
${session.appType || "Not specified"}

Selected Features:
${session.features?.length
  ? session.features.map((feature) => `- ${feature}`).join("\n")
  : "- None"}

Removed Features:
${session.removedFeatures?.length
  ? session.removedFeatures.map((feature) => `- ${feature}`).join("\n")
  : "- None"}

Functional Requirements:
${session.requirements?.length
  ? session.requirements.map((requirement) => `- ${requirement}`).join("\n")
  : "- None"}

Write a professional summary that:
- Clearly explains the purpose of the application.
- Describes the intended users.
- Summarizes the major selected features.
- Includes the important functional requirements.
- Does not include removed features.
- Does not generate source code.
- Uses plain professional English.
- Uses approximately 150 to 250 words.
`;

  const response = await client.responses.create({
    model,
    input: prompt,
  });

  return response.output_text;
};

/*------------------------------------------------------------------------------------ */
module.exports = {
  GenerateAiResponse,
   ExtractRequirementsFromMessage,
   GenerateRequirementSummary,
};