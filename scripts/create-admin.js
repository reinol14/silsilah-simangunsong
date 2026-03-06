// Script untuk membuat admin pertama
// Jalankan dengan: node scripts/create-admin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Membuat akun admin...');
  
  // Ganti username, password, dan nama sesuai kebutuhan
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: 'admin123', // PENTING: Dalam production, gunakan bcrypt untuk hash password!
      nama: 'Administrator',
    },
  });
  
  console.log('✅ Admin berhasil dibuat:');
  console.log('   Username:', admin.username);
  console.log('   Nama:', admin.nama);
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  PENTING: Segera ganti password setelah login pertama!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
