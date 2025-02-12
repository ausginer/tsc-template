import { forEachChild, type Node, type SourceFile } from 'typescript';
import { extractCodePart } from './extractCodePart.js';

export function findBestNode(file: SourceFile): Node | undefined {
  const codePart = extractCodePart(file.getText());

  let latest: Node | undefined = file;
  const callback = (node: Node): Node | undefined => {
    if (node.getText(file) === codePart) {
      // We need the deepest node that matches the desired code part.
      latest = node;
    } else if (latest !== file) {
      // The node text is not the same as the code part anymore, so we return
      // the latest match.
      return latest;
    }

    // If the node text is not the same as code part but the match is still the
    // source file itself, we continue searching.
    return forEachChild(node, callback);
  };

  return forEachChild(file, callback);
}
