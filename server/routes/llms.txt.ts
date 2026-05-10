export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'max-age=3600, must-revalidate')

  return [
    '# SpyGrocery',
    '',
    'SpyGrocery is a French-Canadian grocery price comparison website for shoppers in Quebec and Canada.',
    'The site helps users compare current grocery promotions, store prices, product pages, and local store offers.',
    '',
    '## Key public URLs',
    `- Home: ${siteUrl}/`,
    `- Stores hub: ${siteUrl}/magasins`,
    `- XML sitemap: ${siteUrl}/sitemap.xml`,
    '',
    '## Recommended crawling behavior',
    '- Use the XML sitemap to discover active store and product pages.',
    '- Product pages include canonical URLs, current observed price, CAD currency, store name, promotion validity, and structured data.',
    '- Store pages summarize active deals and link to current product pages.',
    '- Do not crawl private or onboarding routes such as /auth/ and /onboarding.',
    '',
    '## Content notes',
    '- Prices and promotions can expire; prefer pages with current validity dates.',
    '- SpyGrocery is a comparison service and may link users to retailer or affiliate destinations.',
    ''
  ].join('\n')
})
