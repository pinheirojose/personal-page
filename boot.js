// Loads BCP 47 locale catalogs, then page.js, then the runtime.
const LOCALES = ['pt-PT', 'en'];

// Ordered, non-async scripts run in insertion order: React → ReactDOM → runtime.
// script.js skips its own unpkg load when window.React/ReactDOM already exist.
function addScript(src) {
  const s = document.createElement('script');
  s.src = src;
  s.async = false;
  document.head.appendChild(s);
}
addScript('./vendor/react.production.min.js');
addScript('./vendor/react-dom.production.min.js');

async function loadJson(path, label) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + label + ': ' + res.status);
  return res.json();
}

async function loadText(path, label) {
  const res = await fetch(path);
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
  addScript('./script.js');
} catch (err) {
  console.error(err);
}
