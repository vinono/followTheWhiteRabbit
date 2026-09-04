import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const mediaRoot = path.join(process.cwd(), "media");

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");
  const requestedPath = path.resolve(mediaRoot, relativePath);

  if (!requestedPath.startsWith(`${mediaRoot}${path.sep}`) || !requestedPath.endsWith(".jpg")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const photo = await readFile(requestedPath);
    return new NextResponse(photo, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
