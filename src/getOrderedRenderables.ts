import { getTranslation, type Matrix4Like } from "@lakuna/umath/Matrix4";
import {
	createVector3Like,
	squaredDistance,
	type Vector3Like
} from "@lakuna/umath/Vector3";

import type { ReadonlyNode } from "./Node.js";

import RenderableNode from "./RenderableNode.js";

/**
 * Get a representation of the scene composed of a node and its descendents divided into three lists. Between the three lists, each active renderable node will be represented exactly once. The first list contains all active renderable nodes that are part of a user interface in traversal order (children will always be listed after their parents). The second list contains all active non-UI renderable nodes that are guaranteed to be fully opaque, sorted in order of proximity to the viewer (closer nodes are earlier). The third list contains all active non-UI renderable nodes that may be transparent, sorted in order of distance from the viewer (farther nodes are earlier). Each node is paired with its world matrix at the time of traversal.
 * @param scene - The root node of the scene.
 * @param eye - The position of the viewer/camera that will render the scene.
 * @returns A list of UI nodes and their world matrices, a list of opaque nodes and their world matrices, and a list of transparent nodes and their world matrices, in that order.
 * @public
 */
export default function getOrderedRenderables(
	scene: ReadonlyNode,
	eye: Readonly<Vector3Like> = [0, 0, 0]
): readonly [
	readonly (readonly [RenderableNode, Readonly<Matrix4Like>])[],
	readonly (readonly [RenderableNode, Readonly<Matrix4Like>])[],
	readonly (readonly [RenderableNode, Readonly<Matrix4Like>])[]
] {
	// Create the output lists.
	const uiNodes: [RenderableNode, Readonly<Matrix4Like>][] = [];
	const opaqueNodes: [number, RenderableNode, Readonly<Matrix4Like>][] = [];
	const transparentNodes: [number, RenderableNode, Readonly<Matrix4Like>][] =
		[];

	// Create a temporary vector for holding the position of the current node.
	const pos = createVector3Like();

	// Traverse the scene to locate and sort renderable nodes.
	scene.traverse((self, worldMat) => {
		// For non-renderable nodes, immediately pass on to children.
		if (!(self instanceof RenderableNode)) {
			return;
		}

		// For UI nodes, sort in traversal order.
		if (self.ui) {
			uiNodes.push([self, worldMat]);
			return;
		}

		// Get the position of the node.
		getTranslation(worldMat, pos);

		// Get the node's squared distance from the viewer/camera.
		const dist = squaredDistance(eye, pos);

		// For transparent nodes, sort in distance order.
		if (self.transparent) {
			for (let i = 0; i < transparentNodes.length; i++) {
				const transparentDistNode = transparentNodes[i];
				if (!transparentDistNode) {
					continue;
				}

				// Insert this node right before the first node that is closer to the viewer than it is.
				const [otherDist] = transparentDistNode;
				if (otherDist < dist) {
					transparentNodes.splice(i, 0, [dist, self, worldMat]);
					return;
				}
			}

			// If this is the nearest transparent node so far, just add it to the end of the list.
			transparentNodes.push([dist, self, worldMat]);
			return;
		}

		// For opaque nodes, sort in proximity order.
		for (let i = 0; i < opaqueNodes.length; i++) {
			const opaqueDistNode = opaqueNodes[i];
			if (!opaqueDistNode) {
				continue;
			}

			// Insert this node right before the first node that is farther from the viewer than it is.
			const [otherDist] = opaqueDistNode;
			if (otherDist > dist) {
				opaqueNodes.splice(i, 0, [dist, self, worldMat]);
				return;
			}
		}

		// If this is the farthest opaque node so far, just add it to the end of the list.
		opaqueNodes.push([dist, self, worldMat]);
	});

	// Return the output lists, cutting off the squared distance portion of the opaque and transparent lists.
	return [
		uiNodes,
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		opaqueNodes.map(([, node, worldMat]) => [node, worldMat]),
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		transparentNodes.map(([, node, worldMat]) => [node, worldMat])
	];
}
