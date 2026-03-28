import axios from "axios";
async function test() {
  try {
    const response = await axios.post("https://raghu0934-my-embedding-api.hf.space/api/embeddings", {
      model: "nomic-embed-text",
      prompt: "test"
    });
    console.log(response.status);
    console.log(response.data);
  } catch (error) {
    console.log("Error status:", error.response?.status);
    console.error("Error message:", error.message);
  }
}
test();
