import { courts, locations, reservations } from '@/db/schema';

import { InferSelectModel } from 'drizzle-orm';

export type Court = InferSelectModel<typeof courts>;
export type Location = InferSelectModel<typeof locations>;
export type Reservation = InferSelectModel<typeof reservations>;
