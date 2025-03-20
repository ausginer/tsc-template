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
import { $templateResult, isTemplateResult, type TemplateResult } from './TemplateResult.js';

export * from './createTransformer.js';

export default function ast(
  parts: TemplateStringsArray,
  ...fillers: ReadonlyArray<TemplateResult | Node | string | null | undefined>
): TemplateResult {
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
            isIdentifier(n) && n.text === id ? (isTemplateResult(filler) ? filler.node : filler) : n,
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

  const source = transform(createSourceFile('', code, ScriptTarget.Latest, false, ScriptKind.TSX), transformers)
    .transformed[0]!;

  return { brand: $templateResult, node: findBestNode(source), source };
}
