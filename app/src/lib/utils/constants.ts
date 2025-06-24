export const CATEGORIES = {
  GEOGRAPHY: 'geography',
  ENTERTAINMENT: 'entertainment',
  HISTORY: 'history',
  ARTS: 'arts',
  SCIENCE: 'science',
  SPORTS: 'sports',
} as const;

export const CATEGORY_NAMES = {
  [CATEGORIES.GEOGRAPHY]: 'Geography',
  [CATEGORIES.ENTERTAINMENT]: 'Entertainment',
  [CATEGORIES.HISTORY]: 'History',
  [CATEGORIES.ARTS]: 'Arts & Literature',
  [CATEGORIES.SCIENCE]: 'Science & Nature',
  [CATEGORIES.SPORTS]: 'Sports & Leisure',
} as const;

export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

export const CATEGORY_LIST = Object.values(CATEGORIES);
