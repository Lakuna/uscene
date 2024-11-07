import {
	type Matrix4Like,
	createMatrix4Like,
	fromRotationTranslationScale,
	getRotation,
	getScaling,
	getTranslation,
	identity,
	multiply,
	rotate,
	rotateX,
	rotateY,
	rotateZ,
	scale,
	setTranslation,
	targetTo,
	translate
} from "@lakuna/umath/Matrix4";
import {
	type QuaternionLike,
	createQuaternionLike
} from "@lakuna/umath/Quaternion";
import { type Vector3Like, createVector3Like } from "@lakuna/umath/Vector3";

/**
 * A node in a scene graph.
 * @public
 */
export default class Node {
	/**
	 * Create a node in a scene graph.
	 * @param parent - The parent of the node. Should only be `undefined` for the root of a scene graph.
	 * @param enabled - Whether or not the node should be enabled.
	 */
	public constructor(parent?: Node, enabled = true) {
		this.matrix = identity(createMatrix4Like());
		this.enabled = enabled;
		this.parent = parent;
		this.childrenInternal = [];
	}

	/** The transformation matrix of this node relative to its parent. */
	public matrix: Matrix4Like;

	/** Whether or not this node is enabled. Disabled nodes and their descendents are not included in traversals. */
	public enabled: boolean;

	/** The translation of this node relative to its parent. */
	public get translation(): Readonly<Float32Array & Vector3Like> {
		return getTranslation(this.matrix, createVector3Like());
	}

	/** The translation of this node relative to its parent. */
	public set translation(value: Vector3Like) {
		setTranslation(this.matrix, value, this.matrix);
	}

	/** The rotation of this node relative to its parent. */
	public get rotation(): Float32Array & QuaternionLike {
		return getRotation(this.matrix, createQuaternionLike());
	}

	/** The rotation of this node relative to its parent. */
	public set rotation(value: QuaternionLike) {
		fromRotationTranslationScale(
			value,
			this.translation,
			this.scaling,
			this.matrix
		);
	}

	/** The scale of this node relative to its parent. */
	public get scaling(): Float32Array & Vector3Like {
		return getScaling(this.matrix, createVector3Like());
	}

	/** The scale of this node relative to its parent. */
	public set scaling(value: Vector3Like) {
		fromRotationTranslationScale(
			this.rotation,
			this.translation,
			value,
			this.matrix
		);
	}

	/** Reset this node's transformation relative to its parent. */
	public identity(): void {
		identity(this.matrix);
	}

	/**
	 * Rotate this node relative to its parent.
	 * @param r - The number of radians to rotate by.
	 * @param axis - The axis to rotate around.
	 */
	public rotate(r: number, axis: Vector3Like): void {
		rotate(this.matrix, r, axis, this.matrix);
	}

	/**
	 * Rotate this node around the X-axis relative to its parent.
	 * @param r - The number of radians to rotate by.
	 */
	public rotateX(r: number): void {
		rotateX(this.matrix, r, this.matrix);
	}

	/**
	 * Rotate this node around the Y-axis relative to its parent.
	 * @param r - The number of radians to rotate by.
	 */
	public rotateY(r: number): void {
		rotateY(this.matrix, r, this.matrix);
	}

	/**
	 * Rotate this node around the Z-axis relative to its parent.
	 * @param r - The number of radians to rotate by.
	 */
	public rotateZ(r: number): void {
		rotateZ(this.matrix, r, this.matrix);
	}

	/**
	 * Scale this node relative to its parent.
	 * @param s - The scaling factor.
	 */
	public scale(s: Vector3Like): void {
		scale(this.matrix, s, this.matrix);
	}

	/**
	 * Translate this node relative to its parent.
	 * @param t - The translation vector.
	 */
	public translate(t: Vector3Like): void {
		translate(this.matrix, t, this.matrix);
	}

	/**
	 * Position this node such that it is pointing at a target position.
	 * @param eye - The new position of this node.
	 * @param target - The position for this node to point at.
	 * @param up - The up vector.
	 */
	public targetTo(
		eye: Vector3Like,
		target: Vector3Like,
		up: Vector3Like = [0, 1, 0]
	): void {
		targetTo(eye, target, up, this.matrix);
	}

	/**
	 * The parent of this node.
	 * @internal
	 */
	// eslint-disable-next-line no-use-before-define
	private parentInternal: Node | undefined;

	/** The parent of this node. */
	public get parent(): Node | undefined {
		return this.parentInternal;
	}

	/** The parent of this node. */
	public set parent(value: Node | undefined) {
		if (value === this.parent) {
			return;
		}

		this.parent?.removeChild(this);
		value?.addChild(this);
	}

	/**
	 * The children of this node. Do not modify this value directly (use `addChild` and `removeChild` instead).
	 * @internal
	 */
	// eslint-disable-next-line no-use-before-define
	private childrenInternal: Node[];

	/** The children of this node. Do not modify this value directly (use `addChild` and `removeChild` instead). */
	public get children(): readonly Node[] {
		return this.childrenInternal;
	}

	/**
	 * Adds a child to this node.
	 * @param node - The child.
	 */
	public addChild(node: Node): void {
		if (this.children.includes(node)) {
			return;
		}

		node.parentInternal = this;
		this.childrenInternal.push(node);
	}

	/**
	 * Removes a child to this node.
	 * @param node - The child.
	 */
	public removeChild(node: Node): void {
		const index = this.children.indexOf(node);
		if (index < 0) {
			return;
		}

		node.parentInternal = void 0;
		this.childrenInternal.splice(index, 1);
	}

	/**
	 * Performs a function on this node and each of its children recursively.
	 * @param f - The function to perform for each node. Receives as an argument the node and the node's world matrix. If this function returns `true`, the node's children are not included in the traversal.
	 */
	public traverse(
		f:
			| ((self: Node, worldMatrix: Matrix4Like) => boolean)
			| ((self: Node, worldMatrix: Matrix4Like) => void)
	): void {
		// Pass the origin as the original "parent world matrix."
		this.traverseInternal(f, identity(createMatrix4Like()));
	}

	/**
	 * Performs a function on this node and each of its children recursively.
	 * @param f - The function to perform for each node. Receives as an argument the node and the node's world matrix. If this function returns `true`, the node's children are not included in the traversal.
	 * @param parentWorldMatrix - The node's parent's world matrix.
	 * @internal
	 */
	private traverseInternal(
		f:
			| ((self: Node, worldMatrix: Matrix4Like) => boolean)
			| ((self: Node, worldMatrix: Matrix4Like) => void),
		parentWorldMatrix: Matrix4Like
	): void {
		// Skip disabled nodes.
		if (!this.enabled) {
			return;
		}

		// Get this node's world matrix by multiplying its parent's world matrix by its transformation matrix.
		const worldMatrix = multiply(
			parentWorldMatrix,
			this.matrix,
			createMatrix4Like()
		);

		// Perform the function on this node; don't traverse this node's children if the function returns `true`.
		if (f(this, worldMatrix)) {
			return;
		}

		// Perform the function on each of this node's children.
		for (const child of this.children) {
			child.traverseInternal(f, worldMatrix);
		}
	}
}
