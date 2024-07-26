"use server";
import { join } from "path";
import { writeFile } from "fs/promises";

const staticDir = join(process.cwd(), "static");

export async function uploadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split(".").pop();
  const filename = `${Date.now()}.${fileExtension}`;
  await writeFile(join(staticDir, filename), buffer);

  return {
    url: `http://localhost:3000/api/static/${filename}`,
  };
}

export async function upload(formData: FormData) {
  const file = formData.get("file") as File | undefined;
  if (!file || !file.name || !file.size) {
    return { error: "No file found" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split(".").pop();
  const filename = `${Date.now()}.${fileExtension}`;
  await writeFile(join(staticDir, filename), buffer);

  return {
    url: `/api/static/${filename}`,
  };
}
