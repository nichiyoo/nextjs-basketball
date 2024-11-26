import * as z from 'zod';

import { sizeKeys, typeKeys } from './constant';

export const searchSchema = z.object({
	location: z.string(),
	type: z.enum([...typeKeys, 'all']),
	size: z.enum([...sizeKeys, 'all']),
});
