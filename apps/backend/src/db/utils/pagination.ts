export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
  const skip = (page - 1) * pageSize

  return { page, pageSize, skip, take: pageSize }
}

export function createPaginationResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginationResult<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    },
  }
}
