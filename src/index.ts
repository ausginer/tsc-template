import {
  createSourceFile,
  isIdentifier,
  isSourceFile,
  type Node,
  ScriptKind,
  ScriptTarget,
  type SourceFile,
  transform,
  type TransformerFactory,
} from 'typescript';
import { createTransformer } from './createTransformer.js';
import { findBestNode } from './findBestNode.js';

export * from './createTransformer.js';

export default function ast(
  parts: TemplateStringsArray,
  ...fillers: ReadonlyArray<Node | null | undefined>
): SourceFile {
  let code = '';
  const transformers: Array<TransformerFactory<SourceFile>> = [];

  for (let i = 0; i < parts.length; i++) {
    let filler = fillers[i] ?? undefined;
    code += parts[i];

    if (filler != null) {
      const id = `$${crypto.randomUUID().replace(/-/gu, '_')}`;
      code += id;

      if (isSourceFile(filler)) {
        filler = findBestNode(filler);
      }

      transformers.push(createTransformer((n) => (isIdentifier(n) && n.text === id ? filler : n)));
    }
  }

  if (code.includes('%{') || code.includes('}%')) {
    code = code.replaceAll('%{', '/** @START */').replaceAll('}%', '/** @END */');
  }

  if (
    code.indexOf('/** @START */') !== code.lastIndexOf('/** @START */') ||
    code.indexOf('/** @END */') !== code.lastIndexOf('/** @END */')
  ) {
    throw new Error('Only one set of code extractors is allowed: %{ ... }% or /** @START */ ... /** @END */');
  }

  return transform(createSourceFile('', code, ScriptTarget.Latest, false, ScriptKind.TSX), transformers)
    .transformed[0]!;
}
