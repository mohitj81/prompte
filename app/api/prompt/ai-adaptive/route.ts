import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Prompt from "@/models/prompt";
import { execFile } from "child_process";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    await connectToDB();

    // Export the logged-in user's prompts to CSV for Python
    const userPrompts = await Prompt.find({ creatorEmail: session.user.email });
    if (!userPrompts || userPrompts.length === 0) {
      return NextResponse.json(
        { error: "No previous prompts found for this user" },
        { status: 404 }
      );
    }

    const csvPath = path.join(process.cwd(), `ml/${session.user.email}_prompts.csv`);
    const fs = await import("fs");
    const csvContent = userPrompts
  .map((p) => {
    const topic = p.topic ?? "";
    const purpose = p.purpose ?? "";
    return `"${topic.replace(/"/g, '""')}","${purpose.replace(/"/g, '""')}"`;
  })
  .join("\n");
    fs.writeFileSync(csvPath, `topic,purpose\n${csvContent}`, "utf-8");

    // Call the Python script
    const pythonPath = path.join(process.cwd(), "ml/train_and_generate.py");

    const generatedPrompt: string = await new Promise((resolve, reject) => {
      execFile("python", [pythonPath, session.user.email, topic], (err, stdout, stderr) => {
        if (err) return reject(err);
        try {
          const output = JSON.parse(stdout);
          if (output.error) return reject(new Error(output.error));
          resolve(output.generated_prompt);
        } catch (e) {
          reject(e);
        }
      });
    });

    return NextResponse.json({ generatedPrompt });
  } catch (error: any) {
    console.error("Adaptive prompt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate adaptive prompt" },
      { status: 500 }
    );
  }
}
