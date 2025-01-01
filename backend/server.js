require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/generate", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).send({ error: "The topic is required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an assistant that must always return valid JSON data. The responses must be written in Spanish. Generate exactly 5 resolutions for the given topic. Follow this strict JSON format:
                      {
                        "goals": [
                          "Resolution 1",
                          "Resolution 2",
                          "Resolution 3",
                          "Resolution 4",
                          "Resolution 5"
                        ]
                      }
                      Do not include any additional text, comments, or explanations. Only return valid JSON.`
          },
          {
            role: "user",
            content: `Generate resolutions for the topic: ${topic}`
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Retrieve the response content
    let content = response.data.choices[0].message.content.trim();

    // Remove code block delimiters (```json and ```)
    if (content.startsWith("```json")) {
      content = content.slice(7).trim(); // Remove "```json"
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3).trim(); // Remove "```"
    }

    // Try to parse the content as JSON
    try {
      const parsed = JSON.parse(content);

      if (!parsed.goals || !Array.isArray(parsed.goals) || parsed.goals.length !== 5) {
        throw new Error("The JSON does not have the expected format.");
      }

      // Format and send the response
      res.send({
        title: `New Year's Resolutions for ${topic}`,
        goals: parsed.goals,
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError.message, content);
      res.status(500).send({ error: "The response is not valid JSON." });
    }
  } catch (error) {
    console.error("Error calling the OpenAI API:", error.response?.data || error.message);
    res.status(500).send({ error: "There was an issue generating the resolutions." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});