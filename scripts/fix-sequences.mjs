// Script untuk memperbaiki sequence PostgreSQL agar sync dengan data yang ada
// Jalankan: node scripts/fix-sequences.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSequences() {
  try {
    console.log('🔧 Memperbaiki sequences PostgreSQL...\n');

    // Fix Person sequence
    const maxPersonId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "Person"
    `;
    const personMaxId = maxPersonId[0].max_id;
    
    await prisma.$executeRaw`
      SELECT setval('"Person_id_seq"', ${personMaxId}, true)
    `;
    console.log(`✅ Person sequence diset ke: ${personMaxId}`);

    // Fix Marriage sequence
    const maxMarriageId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "Marriage"
    `;
    const marriageMaxId = maxMarriageId[0].max_id;
    
    await prisma.$executeRaw`
      SELECT setval('"Marriage_id_seq"', ${marriageMaxId}, true)
    `;
    console.log(`✅ Marriage sequence diset ke: ${marriageMaxId}`);

    // Fix Child sequence
    const maxChildId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "Child"
    `;
    const childMaxId = maxChildId[0].max_id;
    
    await prisma.$executeRaw`
      SELECT setval('"Child_id_seq"', ${childMaxId}, true)
    `;
    console.log(`✅ Child sequence diset ke: ${childMaxId}`);

    // Fix Admin sequence
    const maxAdminId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "Admin"
    `;
    const adminMaxId = maxAdminId[0].max_id;
    
    await prisma.$executeRaw`
      SELECT setval('"Admin_id_seq"', ${adminMaxId}, true)
    `;
    console.log(`✅ Admin sequence diset ke: ${adminMaxId}`);

    // Fix Donatur sequence
    const maxDonaturId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "donatur"
    `;
    const donaturMaxId = maxDonaturId[0].max_id;
    
    await prisma.$executeRaw`
      SELECT setval('"donatur_id_seq"', ${donaturMaxId}, true)
    `;
    console.log(`✅ Donatur sequence diset ke: ${donaturMaxId}`);

    console.log('\n🎉 Semua sequences berhasil diperbaiki!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequences();
