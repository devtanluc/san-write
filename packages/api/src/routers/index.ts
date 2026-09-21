import { protectedProcedure, publicProcedure, router } from "../index";
import { postRouter } from "./post";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	post: postRouter,
});
export type AppRouter = typeof appRouter;
