import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getElaboratedText3 = async (shortText, clientName) => {
  const clientContext = clientName ? ` for ${clientName}` : '';
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that elaborates work reports and fixes grammar and rephrases text to make it professional and clear."
      },
      {
        role: "user",
        content: `Elaborate this work report and fix grammar corrections and rephrasing the text: ${shortText}${clientContext}`
      }
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  if (!response.choices?.[0]?.message?.content) {
    throw new Error("Invalid response from OpenAI");
  }

  return response.choices[0].message.content.trim();
};
