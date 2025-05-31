import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { z } from 'zod';
import { saltAndHashPassword } from '$lib/utils/helper';

const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().min(2)
});

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { email, password, name } = signupSchema.parse(body);

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return json({ message: 'User already exists' }, { status: 400 });
		}

		// Hash the password
		const hashedPassword = saltAndHashPassword(password);

		// Create the user
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword
			}
		});

		return json({ message: `User ${user.email} created successfully` }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ message: 'Invalid input data' }, { status: 400 });
		}
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}
