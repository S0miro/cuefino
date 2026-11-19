import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pages=['','features/','guide/','safety/','about/','faq/','preregister/','feedback/'];
for(const path of pages)test(`${path || 'home'} restricts content before resources without changing URL or registration target`,()=>{
  const html=readFileSync(new URL('../'+path+'index.html',import.meta.url),'utf8');
  const match=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(match);
  const rules=new Map(match[1].split(';').map(s=>{const [name,...values]=s.trim().split(/\s+/);return[name,values]}));
  for(const directive of ['default-src','base-uri','object-src'])assert.deepEqual(rules.get(directive),["'none'"]);
  assert.deepEqual(rules.get('script-src'),["'self'"]);
  assert.deepEqual(rules.get('style-src'),["'self'"]);
  for(const directive of ['connect-src','form-action'])assert.deepEqual(rules.get(directive),['https://editassist-registration.uu-aa-0301.chatgpt.site']);
  assert.ok(match.index<html.search(/<(script|link)\b/i),'Apply CSP before resources load');
  assert.doesNotMatch(match[1],/unsafe-inline|unsafe-eval|frame-ancestors/,'Meta CSP cannot enforce frame-ancestors');
  assert.ok(html.includes('<meta name="referrer" content="no-referrer">'));
  assert.ok(html.includes('href="https://s0miro.github.io/cuefino/'+path+'"'));
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>\s*[^<\s]/i);
  if(path==='preregister/')assert.match(html,/action="https:\/\/editassist-registration\.uu-aa-0301\.chatgpt\.site\/register"/);
});
