import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { verifyPassword } from '$lib/utils/helper';
import { prisma } from '$lib/prisma';

export const actions = {
	default: async ({ request, cookies }) => {
		console.log('=== LOGIN PROCESS START ===');
		console.log('1. Initializing login handler');

		if (!request) {
			console.error('Request object is undefined');
			return fail(500, { error: 'Invalid request' });
		}
		console.log('Request object is valid');

		try {
			console.log('3. Getting form data');
			const data = await request.formData();
			const formDataObj = Object.fromEntries(data.entries());
			console.log('Form data received:', { ...formDataObj, password: '***' });

			const email = data.get('email');
			const password = data.get('password');

			console.log('4. Validating input');
			console.log('Email present:', !!email);
			console.log('Password present:', !!password);

			if (!email || !password) {
				console.log('Missing email or password');
				return fail(400, {
					error: 'Email and password are required'
				});
			}

			const emailStr = email.toString();
			console.log('5. Preparing database query');
			console.log('Email to query:', emailStr);

			console.log('6. Checking Prisma client');
			console.log('Prisma client available:', !!prisma);
			console.log('Prisma client type:', typeof prisma);
			console.log('Prisma client methods:', Object.keys(prisma));

			console.log('7. Executing database query');
			const user = await prisma.user.findUnique({
				where: { email: emailStr },
				select: {
					id: true,
					email: true,
					name: true,
					password: true
				}
			});

			console.log('8. Processing query result');
			console.log('User found:', !!user);
			if (user) {
				console.log('User data:', {
					id: user.id,
					email: user.email,
					name: user.name,
					hasPassword: !!user.password
				});
			}

			if (!user) {
				console.log('User not found in database');
				return fail(400, {
					error: 'Invalid email or password'
				});
			}

			if (!user.password) {
				console.log('User found but has no password set');
				return fail(400, {
					error: 'Invalid email or password'
				});
			}

			console.log('9. Verifying password');
			const passwordStr = password.toString();
			const isValid = await verifyPassword(passwordStr, user.password);
			console.log('Password verification result:', isValid);

			if (!isValid) {
				console.log('Password verification failed');
				return fail(400, {
					error: 'Invalid email or password'
				});
			}

			console.log('10. Creating session');
			const session = {
				user: {
					id: user.id,
					email: user.email,
					name: user.name
				}
			};
			console.log('Session data:', session);

			console.log('11. Setting session cookie');
			cookies.set('session', JSON.stringify(session), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});
			console.log('Session cookie set successfully');

			console.log('12. Login successful');
			console.log('=== LOGIN PROCESS END - SUCCESS ===');

			return {
				success: true
			};
		} catch (error) {
			console.error('=== ERROR ===');
			console.error('Error type:', error?.constructor?.name);
			console.error('Error message:', error?.message);
			console.error('Error stack:', error?.stack);
			console.error('Full error object:', error);
			return fail(500, {
				error: 'An unexpected error occurred'
			});
		}
	}
} satisfies Actions;
