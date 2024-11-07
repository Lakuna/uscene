import type Node from "./Node.js";
import type { Vector3Like } from "@lakuna/umath";
import getOrderedRenderables from "./getOrderedRenderables.js";

/**
 * Render a scene using the default ordering, as returned by `getOrderedRenderables`.
 * @param scene - The root node of the scene.
 * @param eye - The position of the viewer/camera that will render the scene.
 * @public
 */
export default function render(scene: Node, eye?: Vector3Like): void {
	getOrderedRenderables(scene, eye)
		.flat()
		.forEach(([worldMatrix, node]) => {
			node.render(worldMatrix);
		});
}
