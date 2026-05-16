/**
 * Pre-flight check before any Supabase upsert/insert.
 * Throws a clear error if required fields are missing or falsy,
 * so the 23502 NOT NULL violation never reaches the database.
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[],
  tableName: string
): void {
  const missing = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === ""
  )
  if (missing.length > 0) {
    throw new Error(
      `Missing required fields for "${tableName}": ${missing.join(", ")}. ` +
        `This would cause a 23502 NOT NULL violation.`
    )
  }
}
