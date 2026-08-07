export const contactSubjects = [
  "General inquiry",
  "Bug report",
  "Feature request",
  "Business inquiry",
  "Press",
  "Other",
] as const

export type ContactSubject = (typeof contactSubjects)[number]
