import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check — hanya admin yang bisa generate bio
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const personId = parseInt(id);

    // Ambil data person dengan relasi
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        marriagesAsHusband: {
          include: {
            wife: true,
            children: {
              include: {
                person: true,
              },
            },
          },
        },
        marriagesAsWife: {
          include: {
            husband: true,
            children: {
              include: {
                person: true,
              },
            },
          },
        },
        children: {
          include: {
            marriage: {
              include: {
                husband: true,
                wife: true,
              },
            },
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json(
        { success: false, message: "Person not found" },
        { status: 404 }
      );
    }

    // Persiapkan data untuk prompt AI
    const gender = person.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan";
    const birthInfo = person.tanggalLahir
      ? `lahir pada ${new Date(person.tanggalLahir).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`
      : "";
    const birthPlace = person.tempatLahir ? `di ${person.tempatLahir}` : "";
    const deathInfo = person.tanggalWafat
      ? `dan wafat pada ${new Date(person.tanggalWafat).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`
      : "";

    // Info orang tua
    let parentInfo = "";
    if (person.children.length > 0) {
      const parentMarriage = person.children[0].marriage;
      parentInfo = `Anak dari ${parentMarriage.husband.nama} dan ${parentMarriage.wife.nama}.`;
    }

    // Info pasangan dan anak
    const marriages =
      person.jenisKelamin === "LAKI_LAKI"
        ? person.marriagesAsHusband
        : person.marriagesAsWife;
    let familyInfo = "";
    if (marriages.length > 0) {
      const marriage = marriages[0];
      const spouse =
        person.jenisKelamin === "LAKI_LAKI" 
          ? ("wife" in marriage ? marriage.wife : null)
          : ("husband" in marriage ? marriage.husband : null);
      if (spouse) {
          familyInfo = `Menikah dengan ${spouse.nama}`;
        if (marriage.children.length > 0) {
          const childrenNames = marriage.children
            .map((c) => c.person.nama)
            .join(", ");
          familyInfo += ` dan dikaruniai ${marriage.children.length} anak: ${childrenNames}.`;
        } else {
          familyInfo += ".";
        }
      }
    }

    // Prompt untuk AI
    const prompt = `Buatkan biografi singkat yang elegan dan bermartabat dalam bahasa Indonesia untuk anggota keluarga Simangunsong dengan data berikut:

Nama: ${person.nama}
Jenis Kelamin: ${gender}
${birthInfo} ${birthPlace} ${deathInfo}
${parentInfo}
${familyInfo}

Buatlah dalam 2-3 paragraf yang menggambarkan kehidupan beliau dengan hormat dan penuh kehangatan keluarga. Gunakan gaya bahasa yang sopan dan menghormati. Jangan gunakan format markdown. Tulis dalam bentuk narasi biasa.`;

    // Panggil GitHub Models API
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: "GitHub token tidak ditemukan. Silakan set GITHUB_TOKEN di .env",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://models.inference.ai.azure.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Anda adalah penulis biografi keluarga yang ahli dalam menulis cerita kehidupan dengan gaya yang penuh hormat dan kehangatan.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("GitHub Models API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal generate bio dari AI: " + response.statusText,
        },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    const generatedBio = aiResponse.choices[0].message.content;

    // Update bio di database
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: { bio: generatedBio } as any,
    });

    return NextResponse.json({
      success: true,
      data: {
        bio: generatedBio,
      },
    });
  } catch (error) {
    console.error("Generate bio error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      },
      { status: 500 }
    );
  }
}
