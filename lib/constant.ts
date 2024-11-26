// type Options<T> = Record<T, string>;

export const typeKeys = ['indoor', 'outdoor'] as const;
export const sizeKeys = ['full-court', 'half-court'] as const;

export type CourtSize = (typeof sizeKeys)[number];
export type CourtType = (typeof typeKeys)[number];

export const typeOptions: Record<CourtType, string> = { indoor: 'Indoor Court', outdoor: 'Outdoor Court' };
export const sizeOptions: Record<CourtSize, string> = { 'full-court': 'Full Court', 'half-court': 'Half Court' };
