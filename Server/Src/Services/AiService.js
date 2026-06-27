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

module.exports = {
  GenerateAiResponse,
};