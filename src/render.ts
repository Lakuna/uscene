import type { Vector3Like } from "@lakuna/umath";

import type Node from "./Node.js";

import getOrderedRenderables from "./getOrderedRenderables.js";

/**
 * Render a scene using the default ordering, as returned by {@link getOrderedRenderables}.
 * @param scene - The root node of the scene.
 * @param eye - The position of the viewer/camera that will render the scene.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export default function render(scene: Node, eye?: Readonly<Vector3Like>): void {
	getOrderedRenderables(scene, eye)
		.flat()
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		.forEach(([worldMatrix, node]) => {
			node.render(worldMatrix);
		});
}
