import { NextResponse } from "next/server";
import { ERROR_CODES } from "./errorCodes";

type Json = Record<string, any> | any[] | null;

export const sendSuccess = (
  data: Json = null,
  message = "Success",
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export const sendError = (
  message = "Something went wrong",
  code = ERROR_CODES.INTERNAL_ERROR,
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export default { sendSuccess, sendError };
