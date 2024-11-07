import {
	type Vector3Like,
	createVector3Like,
	squaredDistance
} from "@lakuna/umath/Vector3";
import type Node from "./Node.js";
import RenderableNode from "./RenderableNode.js";
import { getTranslation } from "@lakuna/umath/Matrix4";

/**
 * Get a representation of the scene composed of a node and its descendents divided into three lists. Between the three lists, each active renderable node will be represented exactly once. The first list contains all active renderable nodes that are part of a user interface in traversal order (children will always be listed after their parents). The second list contains all active non-UI renderable nodes that are guaranteed to be fully opaque, sorted in order of proximity to the viewer (closer nodes are earlier). The third list contains all active non-UI renderable nodes that may be transparent, sorted in order of distance from the viewer (farther nodes are earlier).
 * @param scene - The root node of the scene.
 * @param eye - The position of the viewer/camera that will render the scene.
 * @returns A list of UI nodes, a list of opaque nodes, and a list of transparent nodes, in that order.
 * @public
 */
export default function getOrderedRenderables(
	scene: Node,
	eye: Vector3Like = [0, 0, 0]
): [RenderableNode[], RenderableNode[], RenderableNode[]] {
	// Create the output lists.
	const uiNodes: RenderableNode[] = [];
	const opaqueNodes: [number, RenderableNode][] = [];
	const transparentNodes: [number, RenderableNode][] = [];

	// Create a temporary vector for holding the position of the current node.
	const pos = createVector3Like();

	// Traverse the scene to locate and sort renderable nodes.
	scene.traverse((self, worldMatrix) => {
		// For non-renderable nodes, immediately pass on to children.
		if (!(self instanceof RenderableNode)) {
			return false;
		}

		// For UI nodes, sort in traversal order.
		if (self.ui) {
			uiNodes.push(self);
			return false;
		}

		// Get the position of the node.
		getTranslation(worldMatrix, pos);

		// Get the node's squared distance from the viewer/camera.
		const dist = squaredDistance(eye, pos);

		// For transparent nodes, sort in distance order.
		if (self.transparent) {
			for (let i = 0; i < transparentNodes.length; i++) {
				const transparentDistNode = transparentNodes[i];
				if (typeof transparentDistNode === "undefined") {
					continue;
				}

				// Insert this node right before the first node that is closer to the viewer than it is.
				const [otherDist] = transparentDistNode;
				if (otherDist < dist) {
					transparentNodes.splice(i, 0, [dist, self]);
					return false;
				}
			}

			// If this is the nearest transparent node so far, just add it to the end of the list.
			transparentNodes.push([dist, self]);
			return false;
		}

		// For opaque nodes, sort in proximity order.
		for (let i = 0; i < opaqueNodes.length; i++) {
			const opaqueDistNode = opaqueNodes[i];
			if (typeof opaqueDistNode === "undefined") {
				continue;
			}

			// Insert this node right before the first node that is farther from the viewer than it is.
			const [otherDist] = opaqueDistNode;
			if (otherDist > dist) {
				opaqueNodes.splice(i, 0, [dist, self]);
				return false;
			}
		}

		// If this is the farthest opaque node so far, just add it to the end of the list.
		opaqueNodes.push([dist, self]);
		return false;
	});

	// Return the output lists, cutting off the squared distance portion of the opaque and transparent lists.
	return [
		uiNodes,
		opaqueNodes.map(([, node]) => node),
		transparentNodes.map(([, node]) => node)
	];
}
