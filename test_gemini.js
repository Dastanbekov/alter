const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AQ.Ab8RN6KtwPxhGb2X1vWbVz6j2aeb2gVe-D0R_Fg4ULbQvci8rQ");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent("Say hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("Error with gemini-3.1-flash-lite:", e.message);
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result2 = await model2.generateContent("Say hello");
      console.log("gemini-1.5-flash works:", result2.response.text());
    } catch (e2) {
      console.error("Error with gemini-1.5-flash:", e2.message);
    }
  }
}

run();
