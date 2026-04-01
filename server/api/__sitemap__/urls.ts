import { serverSupabaseClient } from '#supabase/server'
import { listSitemapUrls } from '../../services/sitemap/listSitemapUrls'

export default defineSitemapEventHandler(async (event: any) => {
  const supabase = await serverSupabaseClient(event)
  return listSitemapUrls(supabase)
})
