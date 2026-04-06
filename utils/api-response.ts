import { NextResponse } from "next/server";

type ErrorDetail = {
  field?: string;
  message: string;
};

type SuccessResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
  timestamp: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ListData<T> = {
  items: T[];
  total: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || "Operation successful",
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function listResponse<T>(
  items: T[],
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<ListData<T>>> {
  return successResponse(
    { items, total: items.length },
    message,
    status
  );
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<PaginatedData<T>>> {
  const totalPages = Math.ceil(total / limit);
  return successResponse(
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    message,
    status
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: ErrorDetail[]
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && details.length > 0 && { details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

