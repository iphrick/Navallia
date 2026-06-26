import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const barbershopId = formData.get("barbershopId") as string | null;
    const barberId = formData.get("barberId") as string | null;

    if (!file || !barbershopId || !barberId) {
      return NextResponse.json(
        { error: "Arquivo, ID da barbearia ou ID do barbeiro ausentes." },
        { status: 400 }
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET não configurado." },
        { status: 500 }
      );
    }

    const app = getAdminApp();
    const storage = getStorage(app);
    const bucket = storage.bucket(bucketName);
    console.log("[store-file] usando bucket:", bucketName);

    const ext = file.type.split("/")[1] || "jpg";
    const path = `barbers/${barbershopId}/${barberId}/avatar.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileRef = bucket.file(path);
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: { barbershopId, barberId },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("[upload-avatar] Error:", err);
    return NextResponse.json(
      { error: err.message || "Falha ao fazer upload." },
      { status: 500 }
    );
  }
}
