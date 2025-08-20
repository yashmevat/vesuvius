import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export const getElaboratedText3 = async (shortText) => {
  const response = await cohere.generate({
    model: "command",
    prompt: `Elaborate this work report: ${shortText}`,
    max_tokens: 300,
    temperature: 0.7,
  });

  if (!response.generations?.[0]?.text) {
    throw new Error("Invalid response from Cohere");
  }

  return response.generations[0].text.trim();
};
