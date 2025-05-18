import { Alumnus, ClassOption } from "./types";

// Sample data for alumni
// In a real app, this would be fetched from an API
export const alumni: Alumnus[] = [
  {
    id: "1",
    name: "Max Mustermann",
    imageUrl: "/placeholder.svg",
    major: "Computer Science",
    classId: "spring-2024",
  },
  {
    id: "2",
    name: "Laura Schmidt",
    imageUrl: "/placeholder.svg",
    major: "Business Administration",
    classId: "fall-2023",
  },
  {
    id: "3",
    name: "Tobias Weber",
    imageUrl: "/placeholder.svg",
    major: "Electrical Engineering",
    classId: "spring-2023",
  },
  {
    id: "4",
    name: "Sophie Becker",
    imageUrl: "/placeholder.svg",
    major: "Industrial Engineering",
    classId: "fall-2022",
  },
  {
    id: "5",
    name: "Felix Hoffmann",
    imageUrl: "/placeholder.svg",
    major: "Robotics",
    classId: "spring-2022",
  },
  {
    id: "6",
    name: "Emma Schneider",
    imageUrl: "/placeholder.svg",
    major: "Information Systems",
    classId: "fall-2021",
  },
  {
    id: "7",
    name: "Leon Fischer",
    imageUrl: "/placeholder.svg",
    major: "Physics",
    classId: "spring-2020",
  },
  {
    id: "8",
    name: "Anna Schäfer",
    imageUrl: "/placeholder.svg",
    major: "Mechanical Engineering",
    classId: "fall-2018",
  },
];

// Generate class options from 2000 to 2025
export const generateClassOptions = (): ClassOption[] => {
  const options: ClassOption[] = [];

  // Years from 2000 to 2025
  for (let year = 2000; year <= 2025; year++) {
    // Before 2000, just use the year
    if (year < 2000) {
      options.push({
        id: `${year}`,
        label: `${year}`,
        value: `${year}`,
      });
    } else {
      // After 2000, use Spring/Fall for each year
      options.push({
        id: `spring-${year}`,
        label: `Spring ${year}`,
        value: `spring-${year}`,
      });

      // Don't add Fall 2025 as it doesn't exist yet
      if (year < 2025) {
        options.push({
          id: `fall-${year}`,
          label: `Fall ${year}`,
          value: `fall-${year}`,
        });
      }
    }
  }

  // Add special cases for 1998 and 1999
  options.push({
    id: "1999",
    label: "1999",
    value: "1999",
  });
  options.push({
    id: "1998",
    label: "1998",
    value: "1998",
  });

  // Sort options in descending order (newest first)
  return options.sort((a, b) => b.value.localeCompare(a.value));
};

export const classOptions = generateClassOptions();
