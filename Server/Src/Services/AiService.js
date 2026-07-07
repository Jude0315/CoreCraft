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

module.exports = {
  GenerateAiResponse,
   ExtractRequirementsFromMessage,
};