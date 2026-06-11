import fs from 'node:fs/promises';
import path from 'node:path';

const cache = new Map<string, string>();

const load = async (filename: string): Promise<string> => {
  if (cache.has(filename)) return cache.get(filename)!;
  // process.cwd() is backend/ when running `strapi develop --prefix backend`
  const filePath = path.resolve(process.cwd(), '..', 'emails', filename);
  const content = await fs.readFile(filePath, 'utf-8');
  cache.set(filename, content);
  return content;
};

export const renderTemplate = async (
  filename: string,
  params: Record<string, string>,
): Promise<string> => {
  let html = await load(filename);
  for (const [key, value] of Object.entries(params)) {
    html = html.split(`{{params.${key}}}`).join(value);
  }
  return html;
};
