export function buildResponse(
  statusCode: number,
  body: unknown
): { statusCode: number; body: string } {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}
