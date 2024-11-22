import ts, { type Node } from 'typescript';

export function traverse<T extends Node>(node: Node, visitor: (node: Node) => T | undefined): T | undefined {
  function _visitor(n: Node): T | undefined {
    return visitor(n) ?? ts.forEachChild(n, _visitor);
  }

  return _visitor(node);
}
