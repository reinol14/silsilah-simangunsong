import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mysql_conn = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'silsilah_simangunsong',
});

console.log('Mengambil data dari MySQL...');

const [persons] = await mysql_conn.execute('SELECT * FROM Person');
const [marriages] = await mysql_conn.execute('SELECT * FROM Marriage');
const [children] = await mysql_conn.execute('SELECT * FROM Child');

console.log(`Ditemukan: ${persons.length} Person, ${marriages.length} Marriage, ${children.length} Child`);

console.log('Memasukkan data ke Neon...');

for (const p of persons) {
  await prisma.person.upsert({
    where: { id: p.id },
    update: {},
    create: {
      id: p.id,
      nama: p.nama,
      jenisKelamin: p.jenisKelamin,
      tanggalLahir: p.tanggalLahir,
      tanggalWafat: p.tanggalWafat,
      tempatLahir: p.tempatLahir,
      foto: p.foto,
      bio: p.bio,
    },
  });
}
console.log('✅ Person selesai');

for (const m of marriages) {
  await prisma.marriage.upsert({
    where: { id: m.id },
    update: {},
    create: {
      id: m.id,
      husbandId: m.husbandId,
      wifeId: m.wifeId,
    },
  });
}
console.log('✅ Marriage selesai');

for (const c of children) {
  await prisma.child.upsert({
    where: { id: c.id },
    update: {},
    create: {
      id: c.id,
      personId: c.personId,
      marriageId: c.marriageId,
    },
  });
}
console.log('✅ Child selesai');

await mysql_conn.end();
await prisma.$disconnect();
console.log('🎉 Migrasi selesai!');