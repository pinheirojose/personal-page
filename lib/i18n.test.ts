import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCopy, splitProjects, eyebrow, pathFor, navFor, contactLinks } from './i18n.ts';

test('split keeps column order and numbering', () => {
  const s = splitProjects(getCopy('en'), 2);
  assert.deepEqual(s.professional.map((p) => p.number), ['01', '02']);
  assert.equal(s.professional[0].title, 'Imóveis Ana Morgado');
  assert.equal(s.personal[0].title, 'Évora Serviços');
  assert.deepEqual(s.counts, { professional: 3, personal: 3 });
  assert.equal(s.professional[1].isPrivate, true);
  assert.deepEqual(s.professional[0].stack, ['WordPress', 'Houzez', 'MySQL', 'Docker']);
});

test('gallery returns all', () => assert.equal(splitProjects(getCopy('pt')).personal.length, 3));

test('image paths are root-relative', () => {
  assert.equal(getCopy('en').projects[0].image, '/images/imoveis-ana-morgado.webp');
});

test('eyebrow flips number', () => {
  assert.equal(eyebrow('ABOUT / 01'), '01 / ABOUT');
  assert.equal(eyebrow('PROJETOS / 02'), '02 / PROJETOS');
  assert.equal(eyebrow('PROJECTS'), 'PROJECTS');
});

test('paths', () => {
  assert.equal(pathFor('pt', 'home'), '/');
  assert.equal(pathFor('en', 'projects'), '/en/projects');
  assert.equal(navFor('en', 'projects')[2].href, '/en#projects');
  assert.equal(navFor('pt', 'home')[2].href, '#projects');
});

test('locales share keys', () => {
  const keys = (o: object) => Object.keys(o).sort();
  assert.deepEqual(keys(getCopy('pt')), keys(getCopy('en')));
  assert.deepEqual(keys(getCopy('pt').readout), keys(getCopy('en').readout));
});

test('personal page copy updated', () => {
  const p = getCopy('en').projects.find((p) => p.title === 'Personal page')!;
  assert.equal(p.areas, 'Next.js · TypeScript · GSAP');
  assert.equal(getCopy('pt').location, 'Évora');
});

test('contact links resolve email', () => {
  const [email] = contactLinks(getCopy('en'));
  assert.equal(email.href, 'mailto:jbernardopinheiro@gmail.com');
  assert.equal(email.external, false);
});
