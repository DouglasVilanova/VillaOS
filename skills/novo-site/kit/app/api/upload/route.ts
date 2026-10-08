import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const form = await req.formData();
  const arquivo = form.get("file");
  if (!(arquivo instanceof File)) return NextResponse.json({ erro: "Arquivo ausente" }, { status: 400 });
  const r = await uploadImage(arquivo);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 400 });
  return NextResponse.json({ url: r.url });
}
