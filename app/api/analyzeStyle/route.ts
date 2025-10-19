import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Prompt from "@/models/prompt";
import StyleProfile, { IStyleProfile } from "@/models/StyleProfile";
import { analyzePromptStyle, StyleAnalysis } from "@/utils/nebius";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // 1️⃣ Fetch all prompts by this user
    const prompts = await Prompt.find({ creator: session.user.id }).lean();
    if (!prompts.length) {
      return NextResponse.json({ error: "No prompts found" }, { status: 404 });
    }
    const promptTexts = prompts.map(p => p.prompt);

    // 2️⃣ Analyze style using Nebius
    const analysis: StyleAnalysis = await analyzePromptStyle(promptTexts);

    // 3️⃣ Upsert StyleProfile
    const styleProfile: IStyleProfile = await StyleProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        user: session.user.id,
        averagePromptLength: analysis.averageLength,
        frequentWords: analysis.frequentWords,
        categoryDistribution: analysis.categories,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(styleProfile, { status: 200 });
  } catch (err) {
    console.error("Error analyzing style:", err);
    return NextResponse.json({ error: "Failed to analyze style" }, { status: 500 });
  }
}
