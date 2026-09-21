import { postStatus, postVisibility } from "@san/db/schema";
import { LIMITS } from "@san/shared";
import { z } from "zod";

// * Enums

export const postVisibilitySchema = z.enum(postVisibility.enumValues, {
	error: "Visibility must be either private or public.",
});

export const postStatusSchema = z.enum(postStatus.enumValues, {
	error: "Status must be either draft or published.",
});

// * Common fields

export const postTitleSchema = z
	.string({
		error: "Title must be a string.",
	})
	.trim()
	.max(LIMITS.post.titleMax, {
		error: `Title must be ${LIMITS.post.titleMax} characters or fewer.`,
	});

export const postContentSchema = z
	.string({
		error: "Content must be a string.",
	})
	.max(LIMITS.post.contentMax, {
		error: `Content must be ${LIMITS.post.contentMax} characters or fewer.`,
	});

export const postTopicSchema = z
	.string({
		error: "Topic must be a string.",
	})
	.trim()
	.max(LIMITS.post.topicMax, {
		error: `Topic must be ${LIMITS.post.topicMax} characters or fewer.`,
	})
	.nullable();

export const postSlugSchema = z
	.string({
		error: "Slug must be a string.",
	})
	.trim()
	.min(1, {
		error: "Slug cannot be empty.",
	})
	.max(LIMITS.post.slugMax, {
		error: `Slug must be ${LIMITS.post.slugMax} characters or fewer.`,
	})
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		error:
			"Slug can only contain lowercase letters, numbers, and single hyphens between words.",
	});

// * Create

export const createPostSchema = z.object({
	title: postTitleSchema.default(""),
	content: postContentSchema.default(""),
	topic: postTopicSchema.optional().default(null),

	visibility: postVisibilitySchema.default("private"),
	status: z.literal("draft").default("draft"),
});

// * Update

export const updatePostSchema = z
	.object({
		title: postTitleSchema.optional(),
		content: postContentSchema.optional(),
		topic: postTopicSchema.optional(),

		visibility: postVisibilitySchema.optional(),
		status: postStatusSchema.optional(),

		slug: postSlugSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "At least one field must be provided.",
	});

// * Publish post

export const publishPostSchema = z.object({
	title: postTitleSchema.min(1, {
		error: "A published post must have a title.",
	}),

	content: postContentSchema.min(1, {
		error: "A published post must have content.",
	}),

	topic: postTopicSchema.optional(),

	slug: postSlugSchema,

	visibility: z.literal("public", {
		error: "A published post must be public.",
	}),

	status: z.literal("published", {
		error: "A published post must have published status.",
	}),
});

// * Change visibility

export const changePostVisibilitySchema = z.object({
	visibility: postVisibilitySchema,
});

// * Post ID params

export const postIdParamsSchema = z.object({
	id: z.uuid({
		error: "Invalid post ID.",
	}),
});

// * Public post route params

export const publicPostParamsSchema = z.object({
	username: z
		.string({
			error: "Username must be a string.",
		})
		.trim()
		.min(1, {
			error: "Username is required.",
		}),

	slug: postSlugSchema,
});

// * Home filters

export const postListQuerySchema = z.object({
	status: z
		.enum(["all", "public", "private", "draft"], {
			error: "Invalid post filter.",
		})
		.default("all"),
});

// * Types

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type ChangePostVisibilityInput = z.infer<
	typeof changePostVisibilitySchema
>;
export type PostIdParams = z.infer<typeof postIdParamsSchema>;
export type PublicPostParams = z.infer<typeof publicPostParamsSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
