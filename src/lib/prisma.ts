import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
	return new PrismaClient({
		log: ['query', 'error', 'warn']
	});
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

// Test the connection
prisma
	.$connect()
	.then(() => {
		console.log('Successfully connected to the database');
	})
	.catch((error) => {
		console.error('Failed to connect to the database:', error);
	});
