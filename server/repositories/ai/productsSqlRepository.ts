const AI_LOG_PREFIX = '[ai-chat]'

export const executeProductsSelectSql = async (supabase: any, sql: string, requestId?: string): Promise<unknown[]> => {
  const logPrefix = requestId ? `${AI_LOG_PREFIX}[${requestId}]` : AI_LOG_PREFIX
  const startedAt = Date.now()
  const trimmed = sql.trim()
  const sqlPreview = trimmed.replace(/\s+/g, ' ').slice(0, 220)

  console.info(`${logPrefix} repository received SQL`, {
    sqlPreview
  })

  if (!/^select\b/i.test(trimmed)) {
    console.warn(`${logPrefix} blocked non-select query`)
    throw createError({
      statusCode: 400,
      message: 'Only SELECT queries are allowed for execute_sql.'
    })
  }

  const query = trimmed.replace(/^select\b/i, 'SELECT')
  const { data, error } = await supabase.rpc('execute_sql', { query })

  if (error) {
    console.error(`${logPrefix} execute_sql RPC failed`, {
      durationMs: Date.now() - startedAt,
      message: error.message
    })
    throw createError({
      statusCode: 500,
      message: `Failed to execute products SQL query: ${error.message}`
    })
  }

  const rows = Array.isArray(data) ? data : []
  console.info(`${logPrefix} execute_sql RPC success`, {
    durationMs: Date.now() - startedAt,
    rowCount: rows.length
  })

  return rows
}
