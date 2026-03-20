import type { Matrix4Like, Vector3Like } from "@lakuna/umath";

import type Node from "./Node.js";
import type RenderableNode from "./RenderableNode.js";

import getOrderedRenderables from "./getOrderedRenderables.js";

/**
 * Render a scene using the default ordering, as returned by {@link getOrderedRenderables}.
 * @param scene - The root node of the scene.
 * @param f - The rendering function to use on each renderable node. Receives as arguments the node and its world matrix at the time of rendering.
 * @param eye - The position of the viewer/camera that will render the scene.
 * @public
 */
export default function render(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	scene: Node,
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	f: (node: RenderableNode, worldMat: Readonly<Matrix4Like>) => void,
	eye?: Readonly<Vector3Like>
): void {
	getOrderedRenderables(scene, eye)
		.flat()
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		.forEach(([node, worldMat]) => {
			f(node, worldMat);
		});
}
