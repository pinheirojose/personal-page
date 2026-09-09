// Loads BCP 47 locale catalogs, then page.js, then the runtime.
const LOCALES = ['pt-PT', 'en'];

async function loadJson(path, label) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + label + ': ' + res.status);
  return res.json();
}

async function loadText(path, label) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + label + ': ' + res.status);
  return res.text();
}

async function loadMessages() {
  const entries = await Promise.all(
    LOCALES.map(async (tag) => [tag, await loadJson('./locales/' + tag + '.json', tag)])
  );
  return Object.fromEntries(entries);
}

try {
  const [messages, page] = await Promise.all([
    loadMessages(),
    loadText('./page.js', 'page.js'),
  ]);
  window.__I18N__ = messages;
  document.querySelector('script[data-dc-script]').textContent = page;
  const runtime = document.createElement('script');
  runtime.src = './script.js';
  document.head.appendChild(runtime);
} catch (err) {
  console.error(err);
}
