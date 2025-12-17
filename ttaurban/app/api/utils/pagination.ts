/**
 * Pagination utility for extracting and validating pagination parameters
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(req: Request): PaginationParams {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(
    1,
    Math.min(100, Number(searchParams.get("limit")) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
