import { getClasses } from "@/cms/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 },
    );
  }
}
