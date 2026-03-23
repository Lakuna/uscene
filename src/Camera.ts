import {
	createMatrix4Like,
	invert,
	type Matrix4Like,
	multiply,
	ortho,
	orthoGpu,
	perspective,
	perspectiveFromFieldOfView,
	perspectiveGpu
} from "@lakuna/umath/Matrix4";

import Node, { type ReadonlyFloat32Array, type ReadonlyNode } from "./Node.js";

/**
 * A camera that views a scene. Read-only.
 * @public
 */
export interface ReadonlyCamera extends ReadonlyNode {
	/**
	 * Get the world view projection matrix created by multiplying this camera's view projection matrix by the given world matrix. This can be used to render a node as it would appear from the perspective of this camera.
	 * @param worldMat - The world matrix.
	 * @returns The world view projection matrix.
	 */
	readonly getWorldViewProjMat: (
		worldMat: Readonly<Matrix4Like>
	) => Readonly<Matrix4Like> & ReadonlyFloat32Array;

	/** The projection matrix of this camera. */
	readonly projMat: Readonly<Matrix4Like>;

	/** The view matrix of this camera, which represents the transformation that would move a scene into view of this camera. This is the inverse of this camera's world matrix. */
	readonly viewMat: Readonly<Matrix4Like> & ReadonlyFloat32Array;

	/** The view projection matrix of this camera, which represents the transformation that would move a scene into view of this camera and apply a projection to it. This is the product of this camera's view matrix and projection matrix. */
	readonly viewProjMat: Readonly<Matrix4Like> & ReadonlyFloat32Array;
}

/**
 * A camera that views a scene.
 * @public
 */
export default class Camera extends Node implements ReadonlyCamera {
	/** The projection matrix of this camera. */
	public projMat: Matrix4Like;

	/** The view matrix of this camera, which represents the transformation that would move a scene into view of this camera. This is the inverse of this camera's world matrix. */
	public get viewMat(): Readonly<Matrix4Like> & ReadonlyFloat32Array {
		// @ts-expect-error Can be unsafe to improve performance since this matrix is being created in `Node.worldMat` anyway.
		const worldMat: Float32Array & Matrix4Like = this.worldMat;
		return invert(worldMat, worldMat);
	}

	/** The view projection matrix of this camera, which represents the transformation that would move a scene into view of this camera and apply a projection to it. This is the product of this camera's view matrix and projection matrix. */
	public get viewProjMat(): Readonly<Matrix4Like> & ReadonlyFloat32Array {
		// @ts-expect-error Can be unsafe to improve performance since this matrix is being created in `Node.worldMat` anyway.
		const viewMat: Float32Array & Matrix4Like = this.viewMat;
		return multiply(viewMat, this.projMat, viewMat);
	}

	/** Create a camera. */
	public constructor() {
		super(false);
		this.projMat = createMatrix4Like();
	}

	/**
	 * Get the world view projection matrix created by multiplying this camera's view projection matrix by the given world matrix. This can be used to render a node as it would appear from the perspective of this camera.
	 * @param worldMat - The world matrix.
	 * @returns The world view projection matrix.
	 */
	public getWorldViewProjMat(
		worldMat: Readonly<Matrix4Like>
	): Readonly<Matrix4Like> & ReadonlyFloat32Array {
		// @ts-expect-error Can be unsafe to improve performance since this matrix is being created in `Node.worldMat` anyway.
		const viewProjMat: Float32Array & Matrix4Like = this.viewProjMat;
		return multiply(viewProjMat, worldMat, viewProjMat);
	}

	/**
	 * Set this camera to use an orthogonal projection matrix with the given bounds such that the near and far clip planes correspond to a normalized device coordinate Z range of `[-1, 1]` (OpenGL/WebGL).
	 * @param left - The left bound of the frustum.
	 * @param right - The right bound of the frustum.
	 * @param bottom - The bottom bound of the frustum.
	 * @param top - The top bound of the frustum.
	 * @param near - The near bound of the frustum.
	 * @param far - The far bound of the frustum.
	 */
	public ortho(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): void {
		ortho(left, right, bottom, top, near, far, this.projMat);
	}

	/**
	 * Set this camera to use an orthogonal projection matrix with the given bounds such that the near and far clip planes correspond to a normalized device coordinate Z range of `[0, 1]` (WebGPU/Vulkan/DirectX/Metal).
	 * @param left - The left bound of the frustum.
	 * @param right - The right bound of the frustum.
	 * @param bottom - The bottom bound of the frustum.
	 * @param top - The top bound of the frustum.
	 * @param near - The near bound of the frustum.
	 * @param far - The far bound of the frustum.
	 */
	public orthoGpu(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): void {
		orthoGpu(left, right, bottom, top, near, far, this.projMat);
	}

	/**
	 * Set this camera to use a perspective projection matrix with the given bounds such that the near and far clip planes correspond to a normalized device coordinate Z range of `[-1, 1]` (OpenGL/WebGL).
	 * @param fov - The vertical field of view in radians.
	 * @param aspect - The aspect ratio (typically the width of the viewport divided by its height).
	 * @param near - The near bound of the frustum. Must be strictly positive.
	 * @param far - The far bound of the frustum.
	 */
	public perspective(
		fov: number,
		aspect: number,
		near: number,
		far: number
	): void {
		perspective(fov, aspect, near, far, this.projMat);
	}

	/**
	 * Set this camera to use a perspective projection matrix generated from a field of view. Useful for generating projection matrices to be used with the WebXR API.
	 * @param left - The angle to the left of the field of view in degrees.
	 * @param right - The angle to the right of the field of view in degrees.
	 * @param bottom - The angle to the bottom of the field of view in degrees.
	 * @param top - The angle to the top of the field of view in degrees.
	 * @param near - The near bound of the frustum.
	 * @param far - The far bound of the frustum.
	 */
	public perspectiveFromFov(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	): void {
		perspectiveFromFieldOfView(
			left,
			right,
			bottom,
			top,
			near,
			far,
			this.projMat
		);
	}

	/**
	 * Set this camera to use a perspective projection matrix with the given bounds such that the near and far clip planes correspond to a normalized device coordinate Z range of `[0, 1]` (WebGPU/Vulkan/DirectX/Metal).
	 * @param fov - The vertical field of view in radians.
	 * @param aspect - The aspect ratio (typically the width of the viewport divided by its height).
	 * @param near - The near bound of the frustum. Must be strictly positive.
	 * @param far - The far bound of the frustum.
	 */
	public perspectiveGpu(
		fov: number,
		aspect: number,
		near: number,
		far: number
	): void {
		perspectiveGpu(fov, aspect, near, far, this.projMat);
	}
}
