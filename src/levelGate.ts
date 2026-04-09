export const LOGIN_REQUIRED_LEVEL = 4;

export function shouldRequireLoginForLevel(levelId: number): boolean {
  return levelId >= LOGIN_REQUIRED_LEVEL;
}
