import { Button } from "@san/ui/components/button";
import { Spinner } from "@san/ui/components/spinner";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	// Nếu đã có user thì chuyển hướng về home
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession();

		if (session) {
			throw redirect({
				to: "/home",
			});
		}
	},

	component: RouteComponent,
});

function RouteComponent() {
	const [isLoading, setIsLoading] = useState(false);

	async function handleSignIn() {
		setIsLoading(true);

		try {
			await authClient.signIn.social({
				provider: "google",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex h-screen w-full items-center justify-center">
			<Button
				variant="secondary"
				size="lg"
				onClick={handleSignIn}
				disabled={isLoading}
			>
				{isLoading && <Spinner />}
				{isLoading ? "Signing in..." : "Sign in with Google"}
			</Button>
		</div>
	);
}
