import ts, { type Node, type SourceFile, type TransformerFactory } from 'typescript';
import { transform } from './transform.js';

export * from './transform.js';

export default function ast(
  parts: TemplateStringsArray,
  ...fillers: ReadonlyArray<Node | null | undefined>
): SourceFile {
  let code = '';
  const transformers: Array<TransformerFactory<SourceFile>> = [];

  for (let i = 0; i < parts.length; i++) {
    const filler = fillers[i];
    code += parts[i];

    if (filler != null) {
      const id = `id${crypto.randomUUID().replace(/-/gu, '_')}`;
      code += id;

      transformers.push(transform((n) => (ts.isIdentifier(n) && n.text === id ? filler : n)));
    }
  }

  return ts.transform(ts.createSourceFile('f.ts', code, ts.ScriptTarget.Latest, false), transformers).transformed[0]!;
}
