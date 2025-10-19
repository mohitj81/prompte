import { spawn } from "child_process";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    const python = spawn("python", ["./ml/predict.py", prompt]);

    let data = "";
    let errorData = "";

    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      errorData += chunk.toString();
    });

    python.on("close", (code) => {
      if (code !== 0 || errorData) {
        console.error("Python error:", errorData);
        return res.status(500).json({ error: "Prediction failed", details: errorData });
      }

      try {
        const result = JSON.parse(data);
        return res.status(200).json(result);
      } catch (err) {
        console.error("JSON parse error:", err, "Data received:", data);
        return res.status(500).json({ error: "Invalid JSON from Python", details: data });
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
