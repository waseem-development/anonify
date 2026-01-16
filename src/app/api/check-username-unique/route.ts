// src/app/api/check-username-unique/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    await dbConnect(); // connect using cached pattern

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const result = UsernameQuerySchema.safeParse({ username });
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({
      username: result.data.username,
      isVerified: true,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}