import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SITEMAP_URL = 'https://www.spygrocery.com/sitemap.xml';
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 15000;

const getArgValue = (flag, fallback = null) => {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return fallback;
  }

  return process.argv[index + 1] ?? fallback;
};

const hasFlag = (flag) => process.argv.includes(flag);

const sitemapUrl = getArgValue('--sitemap', DEFAULT_SITEMAP_URL);
const concurrency = Math.max(1, Number.parseInt(getArgValue('--concurrency', String(DEFAULT_CONCURRENCY)), 10) || DEFAULT_CONCURRENCY);
const retries = Math.max(0, Number.parseInt(getArgValue('--retries', String(DEFAULT_RETRIES)), 10) || DEFAULT_RETRIES);
const timeoutMs = Math.max(1000, Number.parseInt(getArgValue('--timeout', String(DEFAULT_TIMEOUT_MS)), 10) || DEFAULT_TIMEOUT_MS);
const limit = Math.max(0, Number.parseInt(getArgValue('--limit', '0'), 10) || 0);
const outputPath = getArgValue('--output', null);
const onlyProblems = hasFlag('--only-problems');

const getUrlsFromSitemap = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkUrl = async (url) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'SpyGrocery Sitemap Checker/1.0',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      clearTimeout(timeoutId);
      response.body?.cancel();

      return {
        url,
        status: response.status,
        ok: response.ok,
        finalUrl: response.url
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt >= retries) {
        return {
          url,
          status: 0,
          ok: false,
          finalUrl: null,
          error: error instanceof Error ? error.message : String(error)
        };
      }

      await wait(250 * (attempt + 1));
    }
  }

  return {
    url,
    status: 0,
    ok: false,
    finalUrl: null,
    error: 'Unknown error'
  };
};

const main = async () => {
  const allUrls = await getUrlsFromSitemap(sitemapUrl);
  const urls = limit > 0 ? allUrls.slice(0, limit) : allUrls;
  const results = new Array(urls.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= urls.length) {
        return;
      }

      results[currentIndex] = await checkUrl(urls[currentIndex]);
    }
  });

  await Promise.all(workers);

  const byStatus = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});

  const problems = results.filter((result) => result.status !== 200);

  const report = {
    sitemapUrl,
    checkedAt: new Date().toISOString(),
    total: urls.length,
    concurrency,
    retries,
    timeoutMs,
    byStatus,
    problemCount: problems.length,
    problems: onlyProblems ? problems : results
  };

  if (outputPath) {
    const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
    await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
    await fs.writeFile(resolvedOutputPath, JSON.stringify(report, null, 2));
  }

  console.log(JSON.stringify({
    sitemapUrl: report.sitemapUrl,
    checkedAt: report.checkedAt,
    total: report.total,
    byStatus: report.byStatus,
    problemCount: report.problemCount,
    outputPath: outputPath ? path.resolve(process.cwd(), outputPath) : null
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
