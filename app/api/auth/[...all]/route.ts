import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import { MissingEnvironmentError, missingServerEnvKeys } from "@/lib/env";

function configMissingResponse() {
	return NextResponse.json(
		{
			error: "Configuration serveur incomplete",
			missing: missingServerEnvKeys,
		},
		{ status: 503 },
	);
}

export async function GET(request: Request) {
	try {
		const handler = toNextJsHandler(getAuth());
		return handler.GET(request as never);
	} catch (error) {
		if (error instanceof MissingEnvironmentError) {
			return configMissingResponse();
		}

		throw error;
	}
}

export async function POST(request: Request) {
	try {
		const handler = toNextJsHandler(getAuth());
		return handler.POST(request as never);
	} catch (error) {
		if (error instanceof MissingEnvironmentError) {
			return configMissingResponse();
		}

		throw error;
	}
}
