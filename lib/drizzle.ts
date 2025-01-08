import 'dotenv/config';

import * as schema from '@/db/schema';

import { drizzle } from 'drizzle-orm/libsql';

const production = {
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
};

const development = {
	url: process.env.SQLITE_FILE_NAME!,
};

export default drizzle({
	schema,
	connection: process.env.NODE_ENV === 'production' ? development : development,
});
