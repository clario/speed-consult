import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '$lib/prisma';
import Credentials from '@auth/sveltekit/providers/credentials';
import { signInSchema } from '$lib/zod';
import { saltAndHashPassword } from './utils/helper';
import { dev } from '$app/environment';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {}
			},
			authorize: async (credentials) => {
				const { email, password } = await signInSchema.parseAsync(credentials);

				// logic to salt and hash password
				const pwHash = saltAndHashPassword(password);

				// logic to verify if user exists
				const user = await prisma.user.findUnique({
					where: {
						email: email,
						password: pwHash
					}
				});

				// getUserFromDb(credentials.email, pwHash);

				if (!user) {
					// No user found, so this is their first attempt to login
					// Optionally, this is also the place you could do a user registration
					throw new Error('Invalid credentials.');
				}

				// return JSON object with the user data
				return user;
			}
		})
	],
	trustHost: true,
	secret: dev ? 'dev-secret' : process.env.AUTH_SECRET,
	session: {
		strategy: 'jwt'
	}
});
