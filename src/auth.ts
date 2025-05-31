import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '$lib/prisma';
import Credentials from '@auth/sveltekit/providers/credentials';
import { signInSchema } from '$lib/zod';
import { verifyPassword } from '$lib/utils/helper';
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

				// Find user by email
				const user = await prisma.user.findUnique({
					where: {
						email: email
					}
				});

				if (!user || !user.password) {
					// No user found or user has no password
					throw new Error('Invalid credentials.');
				}

				// Verify password
				const isValid = await verifyPassword(password, user.password);
				
				if (!isValid) {
					throw new Error('Invalid credentials.');
				}

				// return user object with only necessary fields
				return {
					id: user.id,
					email: user.email,
					name: user.name,
					emailVerified: null // Add this to satisfy the type requirement
				};
			}
		})
	],
	trustHost: true,
	secret: dev ? 'dev-secret' : process.env.AUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					id: token.id as string,
					email: token.email as string,
					name: token.name as string,
					emailVerified: null // Add this to satisfy the type requirement
				};
			}
			return session;
		}
	}
});
