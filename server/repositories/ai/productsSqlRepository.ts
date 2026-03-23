export const executeProductsSelectSql = async (supabase: any, sql: string): Promise<unknown[]> => {
  const trimmed = sql.trim()

  if (!/^select\b/i.test(trimmed)) {
    throw createError({
      statusCode: 400,
      message: 'Only SELECT queries are allowed for execute_sql.'
    })
  }

  const query = trimmed.replace(/^select\b/i, 'SELECT')
  const { data, error } = await supabase.rpc('execute_sql', { query })

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to execute products SQL query: ${error.message}`
    })
  }

  const rows = Array.isArray(data) ? data : []
  return rows
}
