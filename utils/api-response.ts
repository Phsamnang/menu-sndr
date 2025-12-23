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

