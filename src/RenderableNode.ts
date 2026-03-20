import type { Matrix4Like } from "@lakuna/umath";

import Node, { type ReadonlyNode } from "./Node.js";

/**
 * A node in a scene graph that can be rendered. Read-only.
 * @public
 */
export interface ReadonlyRenderableNode extends ReadonlyNode {
	/** Whether or not this node may be not completely opaque. */
	readonly transparent: boolean;

	/** Whether or not this node belongs to a user interface or a 2D scene. */
	readonly ui: boolean;
}

/**
 * A node in a scene graph that can be rendered.
 * @public
 */
export default abstract class RenderableNode
	extends Node
	implements ReadonlyRenderableNode
{
	/** Whether or not this node may be not completely opaque. */
	public transparent: boolean;

	/** Whether or not this node belongs to a user interface or a 2D scene. */
	public ui: boolean;

	/**
	 * Create a renderable node in a scene graph.
	 * @param enabled - Whether or not the node should be enabled.
	 * @param transparent - Whether or not the node may be not completely opaque. Setting this to `false` can improve performance but may make transparent nodes display wrong.
	 * @param ui - Whether or not the node belongs to a user interface or a 2D scene. Setting this to `true` can improve performance but may make non-user interface nodes display in the wrong order.
	 */
	public constructor(enabled = true, transparent = true, ui = false) {
		super(enabled);
		this.transparent = transparent;
		this.ui = ui;
	}

	/**
	 * Render this node.
	 * @param worldMatrix - The world matrix of this node.
	 */
	public abstract render(worldMatrix: Readonly<Matrix4Like>): void;
}
