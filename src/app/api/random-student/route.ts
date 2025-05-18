export const dynamic = 'force-dynamic';

import { getClasses } from "@/cms/data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the URL and parse the search params
    const { searchParams } = new URL(request.url);
    const filters = searchParams.get("filters");
    const classFilters = filters ? JSON.parse(filters) : {};

    // Get all classes
    const classes = await getClasses();

    // Filter classes based on the provided filters
    const filteredClasses = classes.filter(
      (cls) => classFilters[`${cls.season} ${cls.year}`],
    );

    if (filteredClasses.length === 0) {
      return NextResponse.json(
        { error: "No classes available with current filters" },
        { status: 400 },
      );
    }

    // Get all students from filtered classes
    const allStudents = filteredClasses.flatMap((cls) =>
      cls.students.map((student) => ({
        student,
        class: cls,
      })),
    );

    if (allStudents.length === 0) {
      return NextResponse.json(
        { error: "No students available in filtered classes" },
        { status: 400 },
      );
    }

    // Select a random student
    const randomIndex = Math.floor(Math.random() * allStudents.length);
    const randomStudent = allStudents[randomIndex];

    return NextResponse.json(randomStudent);
  } catch (error) {
    console.error("Error fetching random student:", error);
    return NextResponse.json(
      { error: "Failed to fetch random student" },
      { status: 500 },
    );
  }
}
