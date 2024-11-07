import Node from "./Node.js";

/** A node in a scene graph that can be rendered. */
export default abstract class RenderableNode extends Node {
	/**
	 * Create a renderable node in a scene graph.
	 * @param parent - The parent of the node. Should only be `undefined` for the root of a scene graph.
	 * @param enabled - Whether or not the node should be enabled.
	 * @param transparent - Whether or not the node may be not completely opaque.
	 * @param ui - Whether or not the node belongs to a user interface.
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

	/** Whether or not this node belongs to a user interface. */
	public ui: boolean;

	/** Render this node. */
	public abstract render(): void;
}
