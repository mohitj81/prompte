export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import Prompt from "@/models/prompt";

export async function GET(request: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";

    // Build regex for query if present
    const regex = query ? new RegExp(query, "i") : null;

    // Build $or filter for search text
    const orFilter = regex
      ? [
          { title: { $regex: regex } },
          { prompt: { $regex: regex } },
          { sampleResult: { $regex: regex } },
          { tags: { $elemMatch: { $regex: regex } } },
          { "creator.username": { $regex: regex } },
        ]
      : [];

    // Build final filter
    const filter: any = {};
    if (orFilter.length > 0) filter.$or = orFilter;
    if (category) filter.category = category;

    const prompts = await Prompt.find(filter)
      .populate("creator", "username image")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Error searching prompts:", error);
    return NextResponse.json({ error: "Failed to search prompts" }, { status: 500 });
  }
}
