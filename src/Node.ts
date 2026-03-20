import {
	copy,
	createMatrix4Like,
	fromRotationTranslationScale,
	getRotation,
	getScaling,
	getTranslation,
	identity,
	type Matrix4Like,
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
	createQuaternionLike,
	type QuaternionLike
} from "@lakuna/umath/Quaternion";
import { createVector3Like, type Vector3Like } from "@lakuna/umath/Vector3";

/**
 * A read-only {@link Float32Array}.
 * @public
 */
export type ReadonlyFloat32Array = Readonly<
	Omit<
		Float32Array,
		"buffer" | "copyWithin" | "fill" | "reverse" | "set" | "sort"
	>
> & {
	/** The {@link ArrayBuffer} instance referenced by the array. */
	readonly buffer: Readonly<
		Pick<
			Float32Array["buffer"],
			"byteLength" | "maxByteLength" | "slice" | typeof Symbol.toStringTag
		>
	>;
};

/**
 * A node in a scene graph. Read-only.
 * @public
 */
export interface ReadonlyNode {
	/** The children of this node. Do not modify this value directly (use {@link Node.addChild} and {@link Node.removeChild} instead). */
	readonly children: readonly ReadonlyNode[];

	/** Whether or not this node is enabled. Disabled nodes and their descendents are not included in traversals. */
	readonly enabled: boolean;

	/** The transformation matrix of this node relative to its parent. */
	readonly matrix: Readonly<Matrix4Like>;

	/** The parent of this node. */
	readonly parent: ReadonlyNode | undefined;

	/** The rotation of this node relative to its parent. */
	readonly rotation: Readonly<QuaternionLike> & ReadonlyFloat32Array;

	/** The scaling of this node relative to its parent. */
	readonly scaling: Readonly<Vector3Like> & ReadonlyFloat32Array;

	/** The root node of this node's scene. */
	readonly scene: ReadonlyNode;

	/** The translation of this node relative to its parent. */
	readonly translation: Readonly<Vector3Like> & ReadonlyFloat32Array;

	/**
	 * Perform a function on this node and each of its children recursively.
	 * @param f - The function to perform for each node. Receives as an argument the node and the node's world matrix. If this function returns `true`, the node's children are not included in the traversal.
	 */
	readonly traverse: (
		f:
			| ((
					self: ReadonlyNode,
					worldMat: Readonly<Matrix4Like> & ReadonlyFloat32Array
			  ) => boolean)
			| ((
					self: ReadonlyNode,
					worldMat: Readonly<Matrix4Like> & ReadonlyFloat32Array
			  ) => void)
	) => void;

	/** The world matrix of this node, which represents its transformation relative to the origin. */
	readonly worldMat: Readonly<Matrix4Like> & ReadonlyFloat32Array;

	/** The translation of this node relative to the origin. */
	readonly worldTranslation: Readonly<Vector3Like> & ReadonlyFloat32Array;
}

/**
 * A node in a scene graph.
 * @public
 */
export default class Node implements ReadonlyNode {
	/** Whether or not this node is enabled. Disabled nodes and their descendents are not included in traversals. */
	public enabled: boolean;

	/** The transformation matrix of this node relative to its parent. */
	public matrix: Matrix4Like;

	/** The children of this node. Do not modify this value directly (use {@link Node.addChild} and {@link Node.removeChild} instead). */
	public get children(): readonly ReadonlyNode[] {
		return this.childrenInternal;
	}

	/** The parent of this node. Set this value by calling {@link Node.addChild} on the parent. */
	public get parent(): Node | undefined {
		return this.parentInternal;
	}

	/*
	// Don't define `set parent` since it has side effects on `value`, which may be unexpected.
	public set parent(value: Node | undefined) {
		if (value === this.parent) {
			return;
		}

		this.parent?.removeChild(this);
		value?.addChild(this);
	}
	*/

	/** The rotation of this node relative to its parent. */
	public get rotation(): Readonly<QuaternionLike> & ReadonlyFloat32Array {
		return getRotation(this.matrix, createQuaternionLike());
	}

	public set rotation(value: Readonly<QuaternionLike>) {
		fromRotationTranslationScale(
			value,
			this.translation,
			this.scaling,
			this.matrix
		);
	}

	/** The scaling of this node relative to its parent. */
	public get scaling(): Readonly<Vector3Like> & ReadonlyFloat32Array {
		return getScaling(this.matrix, createVector3Like());
	}

	public set scaling(value: Readonly<Vector3Like>) {
		fromRotationTranslationScale(
			this.rotation,
			this.translation,
			value,
			this.matrix
		);
	}

	/** The root node of this node's scene. */
	public get scene(): Node {
		return this.parent?.scene ?? this;
	}

	/** The translation of this node relative to its parent. */
	public get translation(): Readonly<Vector3Like> & ReadonlyFloat32Array {
		return getTranslation(this.matrix, createVector3Like());
	}

	public set translation(value: Readonly<Vector3Like>) {
		setTranslation(this.matrix, value, this.matrix);
	}

	/** The world matrix of this node, which represents its transformation relative to the origin. */
	public get worldMat(): Readonly<Matrix4Like> & ReadonlyFloat32Array {
		if (!this.parent) {
			return copy(this.matrix, createMatrix4Like());
		}

		const parentWorldMat = this.parent.worldMat;
		return multiply(parentWorldMat, this.matrix, parentWorldMat);
	}

	/** The translation of this node relative to the origin. */
	public get worldTranslation(): Readonly<Vector3Like> & ReadonlyFloat32Array {
		return getTranslation(this.worldMat, createVector3Like());
	}

	/**
	 * The children of this node. Do not modify this value directly (use {@link Node.addChild} and {@link Node.removeChild} instead).
	 * @internal
	 */
	private readonly childrenInternal: Node[];

	/**
	 * The parent of this node.
	 * @internal
	 */
	private parentInternal: Node | undefined;

	/**
	 * Create a node in a scene graph.
	 * @param enabled - Whether or not the node should be enabled.
	 */
	public constructor(enabled = true) {
		this.matrix = identity(createMatrix4Like());
		this.enabled = enabled;
		this.childrenInternal = [];
	}

	/**
	 * Add a child to this node.
	 * @param node - The child. The child's parent will be updated to point to this node. If the child already had a parent, it will be removed from that parent's children.
	 */
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	public addChild(node: Node): void {
		if (this.children.includes(node)) {
			return;
		}

		node.parent?.removeChild(node);
		node.parentInternal = this;
		this.childrenInternal.push(node);
	}

	/** Reset this node's transformation relative to its parent. */
	public identity(): void {
		identity(this.matrix);
	}

	/**
	 * Remove a child from this node.
	 * @param node - The child. The child's parent will be updated to point to nothing.
	 */
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	public removeChild(node: Node): void {
		const index = this.children.indexOf(node);
		if (index < 0) {
			return;
		}

		node.parentInternal = void 0;
		this.childrenInternal.splice(index, 1);
	}

	/**
	 * Rotate this node relative to its parent.
	 * @param r - The number of radians to rotate by.
	 * @param axis - The axis to rotate around.
	 */
	public rotate(r: number, axis: Readonly<Vector3Like>): void {
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
	public scale(s: Readonly<Vector3Like>): void {
		scale(this.matrix, s, this.matrix);
	}

	/**
	 * Position this node such that it is pointing at a target position.
	 * @param eye - The new position of this node.
	 * @param target - The position for this node to point at.
	 * @param up - The up vector.
	 */
	public targetTo(
		eye: Readonly<Vector3Like>,
		target: Readonly<Vector3Like>,
		up: Readonly<Vector3Like> = [0, 1, 0]
	): void {
		targetTo(eye, target, up, this.matrix);
	}

	/**
	 * Translate this node relative to its parent.
	 * @param t - The translation vector.
	 */
	public translate(t: Readonly<Vector3Like>): void {
		translate(this.matrix, t, this.matrix);
	}

	/**
	 * Perform a function on this node and each of its children recursively.
	 * @param f - The function to perform for each node. Receives as an argument the node and the node's transformation matrix relative to the node on which the traversal started. If this function returns `false`, the node's children are not included in the traversal.
	 */
	public traverse(
		f: // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			| ((self: Node, worldMat: Float32Array & Matrix4Like) => boolean)
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			| ((self: Node, worldMat: Float32Array & Matrix4Like) => void)
	): void {
		this.traverseInternal(f, identity(createMatrix4Like()));
	}

	/**
	 * Perform a function on this node and each of its children recursively.
	 * @param f - The function to perform for each node. Receives as an argument the node and the node's transformation matrix relative to the node on which the traversal started. If this function returns `false`, the node's children are not included in the traversal.
	 * @param parentMat - The node's parent's transformation matrix relative to the node on which the traversal started.
	 * @internal
	 */
	private traverseInternal(
		f: // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			| ((self: Node, worldMat: Float32Array & Matrix4Like) => boolean)
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			| ((self: Node, worldMat: Float32Array & Matrix4Like) => void),
		parentMat: Readonly<Matrix4Like>
	): void {
		// Skip disabled nodes.
		if (!this.enabled) {
			return;
		}

		// Get this node's world matrix by multiplying its parent's world matrix by its transformation matrix.
		const worldMat = multiply(parentMat, this.matrix, createMatrix4Like());

		// Perform the function on this node; don't traverse this node's children if the function returns `false`.
		if (f(this, worldMat) === false) {
			return;
		}

		// Perform the function on each of this node's children.
		for (const child of this.childrenInternal) {
			child.traverseInternal(f, worldMat);
		}
	}
}
