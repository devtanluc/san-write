import type { PostIdParams, PostListQuery } from "@san/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export function usePosts(filter: PostListQuery) {
	return useQuery(trpc.post.getAll.queryOptions(filter));
}

export function usePost(input: PostIdParams) {
	return useQuery(trpc.post.getById.queryOptions(input));
}

export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.post.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.post.getAll.queryKey(),
				});
			},
		}),
	);
}

export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.post.update.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.post.getAll.queryKey(),
				});

				queryClient.invalidateQueries({
					queryKey: trpc.post.getById.queryKey({
						id: variables.id,
					}),
				});
			},
		}),
	);
}

export function usePublishPost() {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.post.publish.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.post.getAll.queryKey(),
				});

				queryClient.invalidateQueries({
					queryKey: trpc.post.getById.queryKey({
						id: variables.id,
					}),
				});
			},
		}),
	);
}

export function useChangePostVisibility() {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.post.changeVisibility.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.post.getAll.queryKey(),
				});

				queryClient.invalidateQueries({
					queryKey: trpc.post.getById.queryKey({
						id: variables.id,
					}),
				});
			},
		}),
	);
}

export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.post.delete.mutationOptions({
			onSuccess: (_, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.post.getAll.queryKey(),
				});

				queryClient.removeQueries({
					queryKey: trpc.post.getById.queryKey({
						id: variables.id,
					}),
				});
			},
		}),
	);
}
