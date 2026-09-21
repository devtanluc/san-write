import { pgEnum } from "drizzle-orm/pg-core";

export const postVisibility = pgEnum("post_visibility", ["private", "public"]);
export const postStatus = pgEnum("post_status", ["draft", "published"]);
