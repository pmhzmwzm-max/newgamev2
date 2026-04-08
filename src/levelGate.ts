export const LOGIN_REQUIRED_LEVEL = 18;

export function shouldRequireLoginForLevel(levelId: number): boolean {
  return levelId >= LOGIN_REQUIRED_LEVEL;
}
