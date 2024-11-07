import type { Matrix4Like } from "@lakuna/umath";
import Node from "./Node.js";

/**
 * A node in a scene graph that can be rendered.
 * @public
 */
export default abstract class RenderableNode extends Node {
	/**
	 * Create a renderable node in a scene graph.
	 * @param parent - The parent of the node. Should only be `undefined` for the root of a scene graph.
	 * @param enabled - Whether or not the node should be enabled.
	 * @param transparent - Whether or not the node may be not completely opaque.
	 * @param ui - Whether or not the node belongs to a user interface or a 2D scene.
	 */
	public constructor(
		parent?: Node,
		enabled = true,
		transparent = false,
		ui = false
	) {
		super(parent, enabled);
		this.transparent = transparent;
		this.ui = ui;
	}

	/** Whether or not this node may be not completely opaque. */
	public transparent: boolean;

	/** Whether or not this node belongs to a user interface or a 2D scene. */
	public ui: boolean;

	/**
	 * Render this node.
	 * @param worldMatrix - The world matrix of this node.
	 */
	public abstract render(worldMatrix: Matrix4Like): void;
}
