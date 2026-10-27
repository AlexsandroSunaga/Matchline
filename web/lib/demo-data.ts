export const pipelineSteps = [
  { step: "Read", desc: "Upload a CSV with a name column and, ideally, an email column" },
  { step: "Clean", desc: "Ignore case, punctuation and words like Inc, LLC and Ltd before comparing names" },
  { step: "Compare", desc: "Score every pair of names with token_sort_ratio. Rows with the same email are always linked, and rows on different email domains stay apart unless the names are almost identical" },
  { step: "Group and export", desc: "Linked rows form a group. Download one cleaned row per company, with the source rows it replaces" },
];
