import crypto from 'crypto';

export function saltAndHashPassword(password: string): string {
	// Generate a random salt
	const salt = crypto.randomBytes(16).toString('hex');

	// Hash the password with the salt
	const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

	// Return the salt and hash combined
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
	const [salt, hash] = hashedPassword.split(':');
	const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	return hash === verifyHash;
}
