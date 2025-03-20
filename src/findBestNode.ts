import { forEachChild, type Node, type SourceFile } from 'typescript';
import { extractCodePart } from './extractCodePart.js';

/**
 * Checks if the node comes from transformer.
 * @param node - The node to check.
 */
function isInjectedNode(node: Node): boolean {
  return node.pos < 0 || node.end < 0;
}

export function findBestNode(file: SourceFile): Node {
  const codePart = extractCodePart(file.getText());

  let latest: Node = file;
  const find = (node: Node): Node | undefined => {
    if (!isInjectedNode(node) && node.getText(file) === codePart) {
      // We need the deepest node that matches the desired code part.
      latest = node;
    } else if (latest !== file) {
      // The node text is not the same as the code part anymore, so we return
      // the latest match.
      return latest;
    }

    // If the node text is not the same as code part but the match is still the
    // source file itself, we continue searching.
    return forEachChild(node, find);
  };

  return forEachChild(file, find) ?? latest;
}
