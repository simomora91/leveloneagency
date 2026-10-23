// Trasforma gli articoli in content/blog/*.md nei dati del sito e nella sitemap.
// Gira da solo prima di "npm start" e "npm run build".
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content/blog');
const SITE = 'https://leveloneagency.ch';
const CATEGORIES = ['info', 'tips', 'eventi', 'formazione'];

const longDate = new Intl.DateTimeFormat('it-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const eventDate = new Intl.DateTimeFormat('it-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function fail(file, msg) {
  console.error(`\n✖ Blog: ${file}: ${msg}\n`);
  process.exit(1);
}

function parseDate(file, key, value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) fail(file, `"${key}" deve essere una data AAAA-MM-GG`);
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) fail(file, `"${key}" non è una data valida`);
  return d;
}

/** Intestazione semplice "chiave: valore" tra due righe "---". */
function parseFile(file, raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!m) fail(file, 'manca l\'intestazione tra le righe ---');
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) fail(file, `riga non valida nell'intestazione: "${line}"`);
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1);
    meta[key] = value;
  }
  return { meta, body: m[2] };
}

const files = readdirSync(contentDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
const posts = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(file, 'il nome del file deve essere minuscolo, con trattini e senza accenti');
  const { meta, body } = parseFile(file, readFileSync(join(contentDir, file), 'utf8'));
  if (meta.draft === 'true') continue;

  for (const key of ['title', 'description', 'date', 'category']) {
    if (!meta[key]) fail(file, `manca "${key}"`);
  }
  if (!CATEGORIES.includes(meta.category)) fail(file, `categoria "${meta.category}" non valida (${CATEGORIES.join(', ')})`);
  const date = parseDate(file, 'date', meta.date);

  const words = body.replace(/[#>*_`\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  const post = {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    dateLabel: longDate.format(date),
    category: meta.category,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    html: marked.parse(body, { async: false }),
  };
  if (meta.cover) {
    post.cover = meta.cover;
    post.coverAlt = meta.coverAlt ?? '';
  }
  if (meta.eventDate) {
    post.event = {
      date: meta.eventDate,
      dateLabel: eventDate.format(parseDate(file, 'eventDate', meta.eventDate)).replace(',', ''),
      ...(meta.eventTime && { time: meta.eventTime }),
      ...(meta.eventPlace && { place: meta.eventPlace }),
      ...(meta.eventPrice && { price: meta.eventPrice }),
      ...(meta.eventCtaUrl && { ctaUrl: meta.eventCtaUrl }),
      ...(meta.eventCtaLabel && { ctaLabel: meta.eventCtaLabel }),
    };
  }
  posts.push(post);
}

// Più recenti in alto; a parità di data prima gli appuntamenti, poi in ordine alfabetico
posts.sort((a, b) => b.date.localeCompare(a.date) || Number(!!b.event) - Number(!!a.event) || a.title.localeCompare(b.title));

writeFileSync(
  join(root, 'src/app/blog/posts.generated.ts'),
  `// File generato da scripts/build-blog.mjs: non modificarlo a mano, modifica content/blog/*.md\n` +
    `import type { Post } from './post';\n\nexport const POSTS: Post[] = ${JSON.stringify(posts, null, 2)};\n`,
);

const urls = [
  { loc: `${SITE}/` },
  { loc: `${SITE}/blog/`, lastmod: posts[0]?.date },
  ...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}/`, lastmod: p.date })),
];
writeFileSync(
  join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    `\n</urlset>\n`,
);

console.log(`Blog: ${posts.length} articoli pronti`);
