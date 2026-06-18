export async function safeQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(
      `[${label}]`,
      error instanceof Error ? error.message : error,
    );

    return fallback;
  }
}
