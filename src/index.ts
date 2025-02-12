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
  ...fillers: ReadonlyArray<Node | string | null | undefined>
): SourceFile {
  let code = '';
  const transformers: Array<TransformerFactory<SourceFile>> = [];

  for (let i = 0; i < parts.length; i++) {
    const filler = fillers[i];
    code += parts[i];

    if (filler != null) {
      if (typeof filler === 'string') {
        code += filler;
      } else {
        const id = `$${crypto.randomUUID().replace(/-/gu, '_')}`;
        code += id;

        transformers.push(
          createTransformer((n) =>
            isIdentifier(n) && n.text === id ? (isSourceFile(filler) ? findBestNode(filler) : filler) : n,
          ),
        );
      }
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
