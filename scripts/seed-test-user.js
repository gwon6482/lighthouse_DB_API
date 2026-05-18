require('dotenv').config();
const dns = require('dns');
const dnsServers = dns.getServers();
if (dnsServers.length === 1 && dnsServers[0] === '127.0.0.1') {
  dns.setServers(['168.126.63.1', '8.8.8.8', '1.1.1.1']);
}
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB 연결');

  const existing = await User.findOne({ email: 'test' });
  if (existing) {
    console.log('⚠️  이미 존재하는 테스트 유저:');
    console.log(`   uid   : ${existing.uid}`);
    console.log(`   email : ${existing.email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('test', 10);

  const user = await User.create({
    email: 'test',
    passwordHash,
    authProviders: [{ provider: 'local', providerId: 'test' }],
  });

  console.log('✅ 테스트 유저 생성 완료');
  console.log(`   uid   : ${user.uid}`);
  console.log(`   email : ${user.email}`);
  console.log(`   _id   : ${user._id}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
