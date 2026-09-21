import { isNotNull } from "drizzle-orm";
import {
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { postStatus, postVisibility } from "./enums";

export const post = pgTable(
	"post",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		title: text("title").notNull().default(""),
		content: text("content").notNull().default(""), // markdown
		topic: text("topic"),

		visibility: postVisibility("visibility").notNull().default("private"),
		status: postStatus("status").notNull().default("draft"),

		// Only set once a post is published - null while it's a draft.
		slug: text("slug"),

		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		publishedAt: timestamp("published_at", { withTimezone: true }),
	},
	(t) => [
		// Home: "my posts" list, newest first, filtered by status/visibility
		index("posts_author_created_idx").on(t.authorId, t.createdAt),
		index("posts_author_status_idx").on(t.authorId, t.status),

		// Public profile: WHERE author_id = ? AND visibility = 'public'
		index("posts_author_visibility_idx").on(t.authorId, t.visibility),

		// /[username]/writing/[slug] lookup — slug only needs to be unique
		// per author, not globally. Partial index since drafts have no slug.
		uniqueIndex("posts_author_slug_idx")
			.on(t.authorId, t.slug)
			.where(isNotNull(t.slug)),
	],
);
