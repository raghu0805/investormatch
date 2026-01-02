import axios from "axios";

/**
 * Generates embedding using Hugging Face hosted model
 * @param {string} text - input text to embed
 * @returns {number[]} embedding vector
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text input is required for embedding");
  }

    try {
    const response = await axios.post(
      "https://raghu0934-my-embedding-api.hf.space/api/embeddings",
      {
        model: "nomic-embed-text",
        prompt: text
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const embedding = response.data?.embedding;

    if (!Array.isArray(embedding)) {
      throw new Error("Invalid embedding returned from API");
    }

    return embedding;

  }catch (error) {
    console.error("Embedding generation failed:", error.message);
    throw error;
  }
}
