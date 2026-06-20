import type { Category } from "@/lib/types";

/** Service categories (alphabetical, matching the register + directory filters). */
export const CATEGORIES: Category[] = [
  { value: "beauty-and-wellness", label: "Beauty and wellness", tone: "purple" },
  { value: "educations", label: "Educations", tone: "brand" },
  { value: "events-and-entertainment", label: "Events and entertainment", tone: "orange" },
  { value: "law-and-consultancy", label: "Law & Consultancy", tone: "teal" },
  { value: "medical", label: "Medical", tone: "success" },
  { value: "other", label: "Other", tone: "neutral" },
  { value: "personal-meetings", label: "Personal meetings and services", tone: "brand" },
  { value: "sport-and-gym", label: "Sport & Gym", tone: "warning" },
];

export const categoryByValue = (value: string) =>
  CATEGORIES.find((c) => c.value === value);
