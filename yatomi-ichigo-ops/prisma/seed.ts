import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const password = await hash("password", 10);

  // 提携店舗
  const store = await prisma.store.upsert({
    where: { id: "store-1" },
    update: {},
    create: {
      id: "store-1",
      name: "提携スーパー弥富店",
      address: "愛知県弥富市○○町1-2-3",
      contact: "0567-00-0000",
    },
  });

  // 管理者（株式会社Lカート）
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password,
      name: "管理者（Lカート）",
      role: Role.ADMIN,
    },
  });

  // 福祉運営（管理者）
  await prisma.user.upsert({
    where: { email: "welfare@example.com" },
    update: {},
    create: {
      email: "welfare@example.com",
      password,
      name: "福祉運営管理者",
      role: Role.WELFARE_MANAGER,
    },
  });

  // 支援品質（サービス管理責任者）
  await prisma.user.upsert({
    where: { email: "quality@example.com" },
    update: {},
    create: {
      email: "quality@example.com",
      password,
      name: "サービス管理責任者",
      role: Role.QUALITY_MANAGER,
    },
  });

  // 現場職員
  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      email: "staff@example.com",
      password,
      name: "現場職員A",
      role: Role.STAFF,
    },
  });

  // 提携店舗ユーザー
  await prisma.user.upsert({
    where: { email: "store@example.com" },
    update: {},
    create: {
      email: "store@example.com",
      password,
      name: "店舗担当者",
      role: Role.STORE,
      storeId: store.id,
    },
  });

  // 資材の初期データ
  const supplies = [
    { name: "パック容器", unit: "個" },
    { name: "ラベルシール", unit: "枚" },
    { name: "出荷用段ボール", unit: "箱" },
    { name: "使い捨て手袋", unit: "双" },
    { name: "アルコール消毒液", unit: "本" },
  ];

  for (const s of supplies) {
    await prisma.inventoryItem.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
