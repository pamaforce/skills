#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillDir = path.join(root, 'skills', 'vefaas');
const skillPath = path.join(skillDir, 'SKILL.md');
const agentPath = path.join(skillDir, 'agents', 'openai.yaml');
const appRefPath = path.join(skillDir, 'references', 'vefaas-application.md');

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function exists(file) {
  return fs.existsSync(file);
}

if (!exists(skillPath)) {
  fail('missing skills/vefaas/SKILL.md');
} else {
  const skill = read(skillPath);
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    fail('SKILL.md is missing YAML frontmatter');
  } else {
    if (!/^name:\s*vefaas$/m.test(frontmatter[1])) fail('frontmatter must include name: vefaas');
    if (!/^description:\s*".+"/m.test(frontmatter[1])) fail('frontmatter must include quoted description');
  }
  if (!skill.includes('@volcengine/vefaas-cli') || !skill.includes('0.2.0')) {
    fail('SKILL.md must mention @volcengine/vefaas-cli >= 0.2.0');
  }
}

if (!exists(agentPath)) {
  fail('missing skills/vefaas/agents/openai.yaml');
} else {
  const agent = read(agentPath);
  if (!agent.includes('display_name:')) fail('openai.yaml must include interface.display_name');
  if (!agent.includes('short_description:')) fail('openai.yaml must include interface.short_description');
  if (!agent.includes('$vefaas')) fail('openai.yaml default_prompt must mention $vefaas');
}

if (!exists(appRefPath)) {
  fail('missing references/vefaas-application.md');
} else {
  const appRef = read(appRefPath);
  if (!appRef.includes('## 目录')) {
    fail('vefaas-application.md is longer than 100 lines and should include a TOC');
  }
}

const mdFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith('.md')) mdFiles.push(full);
  }
}
walk(skillDir);

const linkPattern = /\[[^\]]+\]\(([^)#]+\.md)\)/g;
for (const file of mdFiles) {
  const text = read(file);
  for (const match of text.matchAll(linkPattern)) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!exists(target)) {
      fail(`broken markdown link: ${path.relative(root, file)} -> ${match[1]}`);
    }
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!line.includes('vefaas run listgateways')) return;
    const context = lines.slice(Math.max(0, index - 3), index + 2).join('\n');
    if (!/(禁止|不要|旧命令|旧写法|迁移)/.test(context)) {
      fail(`legacy command appears outside a deprecated-pattern warning: ${path.relative(root, file)}:${index + 1}`);
    }
  });
}

if (failures.length > 0) {
  console.error('vefaas skill validation failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('vefaas skill validation passed.');
