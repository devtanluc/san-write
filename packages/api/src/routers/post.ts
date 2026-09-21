import { post } from "@san/db/schema";
import {
	changePostVisibilitySchema,
	createPostSchema,
	type PostListQuery,
	postIdParamsSchema,
	postListQuerySchema,
	publishPostSchema,
	updatePostSchema,
} from "@san/validation/post";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { protectedProcedure, router } from "../index";

export function buildPostListWhere(
	userId: string,
	status: PostListQuery["status"] = "all",
) {
	switch (status) {
		case "public":
			return {
				authorId: userId,
				visibility: "public" as const,
			};

		case "private":
			return {
				authorId: userId,
				visibility: "private" as const,
			};

		case "draft":
			return {
				authorId: userId,
				status: "draft" as const,
			};

		case "all":
			return {
				authorId: userId,
			};
	}
}

export const postRouter = router({
	// * Get current user's posts
	getAll: protectedProcedure
		.input(postListQuerySchema.optional())
		.query(async ({ input, ctx }) => {
			const where = buildPostListWhere(ctx.session.user.id, input?.status);

			return ctx.db.query.post.findMany({
				where,
				orderBy: {
					updatedAt: "desc",
				},
			});
		}),

	// * Get one post owned by current user
	getById: protectedProcedure
		.input(postIdParamsSchema)
		.query(async ({ input, ctx }) => {
			const result = await ctx.db.query.post.findFirst({
				where: {
					id: input.id,
					authorId: ctx.session.user.id,
				},
			});

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found.",
				});
			}

			return result;
		}),

	// * Create a new draft
	create: protectedProcedure
		.input(createPostSchema)
		.mutation(async ({ input, ctx }) => {
			const [createdPost] = await ctx.db
				.insert(post)
				.values({
					authorId: ctx.session.user.id,
					title: input.title,
					content: input.content,
					topic: input.topic,
					visibility: input.visibility,
					status: input.status,
				})
				.returning();

			if (!createdPost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create post.",
				});
			}

			return createdPost;
		}),

	// * Autosave / update post
	update: protectedProcedure
		.input(
			updatePostSchema.extend({
				id: postIdParamsSchema.shape.id,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			const [updatedPost] = await ctx.db
				.update(post)
				.set(data)
				.where(and(eq(post.id, id), eq(post.authorId, ctx.session.user.id)))
				.returning();

			if (!updatedPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found.",
				});
			}

			return updatedPost;
		}),

	// * Publish post
	publish: protectedProcedure
		.input(
			publishPostSchema.extend({
				id: postIdParamsSchema.shape.id,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [publishedPost] = await ctx.db
				.update(post)
				.set({
					title: input.title,
					content: input.content,
					topic: input.topic,
					slug: input.slug,
					visibility: "public",
					status: "published",
					publishedAt: new Date(),
				})
				.where(
					and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)),
				)
				.returning();

			if (!publishedPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found.",
				});
			}

			return publishedPost;
		}),

	// * Change visibility
	changeVisibility: protectedProcedure
		.input(
			changePostVisibilitySchema.extend({
				id: postIdParamsSchema.shape.id,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [updatedPost] = await ctx.db
				.update(post)
				.set({
					visibility: input.visibility,
				})
				.where(
					and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)),
				)
				.returning();

			if (!updatedPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found.",
				});
			}

			return updatedPost;
		}),

	// * Delete post
	delete: protectedProcedure
		.input(postIdParamsSchema)
		.mutation(async ({ input, ctx }) => {
			const [deletedPost] = await ctx.db
				.delete(post)
				.where(
					and(eq(post.id, input.id), eq(post.authorId, ctx.session.user.id)),
				)
				.returning({
					id: post.id,
				});

			if (!deletedPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Post not found.",
				});
			}

			return deletedPost;
		}),
});
