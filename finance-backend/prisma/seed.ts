import bcrypt from 'bcryptjs';
import { PrismaClient, RecordType, Role, Status } from '@prisma/client';
import { generateRecordSlug, generateUserSlug } from '../src/utils/slug';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
};

type SeedRecord = {
  ownerEmail: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string;
};

const DEMO_USERS: SeedUser[] = [
  {
    name: 'System Admin',
    email: 'admin@gmail.com',
    password: 'admintester1234',
    role: Role.ADMIN,
    status: Status.ACTIVE,
  },
  {
    name: 'Ava Analyst',
    email: 'analyst.ava@gmail.com',
    password: 'analystpass123',
    role: Role.ANALYST,
    status: Status.ACTIVE,
  },
  {
    name: 'Noah Analyst',
    email: 'analyst.noah@gmail.com',
    password: 'analystpass123',
    role: Role.ANALYST,
    status: Status.ACTIVE,
  },
  {
    name: 'Vera Viewer',
    email: 'viewer.vera@gmail.com',
    password: 'viewerpass123',
    role: Role.VIEWER,
    status: Status.ACTIVE,
  },
  {
    name: 'Liam Viewer',
    email: 'viewer.liam@gmail.com',
    password: 'viewerpass123',
    role: Role.VIEWER,
    status: Status.INACTIVE,
  },
];

const DEMO_RECORDS: SeedRecord[] = [
  {
    ownerEmail: 'admin@gmail.com',
    amount: 9500,
    type: RecordType.INCOME,
    category: 'Salary',
    date: '2026-01-05T10:00:00.000Z',
    notes: 'Monthly salary credited',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 2200,
    type: RecordType.EXPENSE,
    category: 'Rent',
    date: '2026-01-07T10:00:00.000Z',
    notes: 'Office rent payment',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 310,
    type: RecordType.EXPENSE,
    category: 'Internet',
    date: '2026-01-09T10:00:00.000Z',
    notes: 'Business internet bill',
  },
  {
    ownerEmail: 'analyst.ava@gmail.com',
    amount: 740,
    type: RecordType.EXPENSE,
    category: 'Marketing',
    date: '2026-01-15T10:00:00.000Z',
    notes: 'Campaign spend',
  },
  {
    ownerEmail: 'analyst.ava@gmail.com',
    amount: 2100,
    type: RecordType.INCOME,
    category: 'Consulting',
    date: '2026-01-20T10:00:00.000Z',
    notes: 'Client consulting retainer',
  },
  {
    ownerEmail: 'analyst.noah@gmail.com',
    amount: 530,
    type: RecordType.EXPENSE,
    category: 'Software',
    date: '2026-02-03T10:00:00.000Z',
    notes: 'SaaS subscriptions',
  },
  {
    ownerEmail: 'analyst.noah@gmail.com',
    amount: 1800,
    type: RecordType.INCOME,
    category: 'Services',
    date: '2026-02-11T10:00:00.000Z',
    notes: 'Monthly service contract',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 420,
    type: RecordType.EXPENSE,
    category: 'Utilities',
    date: '2026-02-13T10:00:00.000Z',
    notes: 'Electricity and water',
  },
  {
    ownerEmail: 'analyst.ava@gmail.com',
    amount: 950,
    type: RecordType.EXPENSE,
    category: 'Travel',
    date: '2026-02-17T10:00:00.000Z',
    notes: 'Client meeting trip',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 10000,
    type: RecordType.INCOME,
    category: 'Salary',
    date: '2026-02-28T10:00:00.000Z',
    notes: 'Monthly salary credited',
  },
  {
    ownerEmail: 'analyst.noah@gmail.com',
    amount: 260,
    type: RecordType.EXPENSE,
    category: 'Supplies',
    date: '2026-03-04T10:00:00.000Z',
    notes: 'Office supplies purchase',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 1450,
    type: RecordType.INCOME,
    category: 'Interest',
    date: '2026-03-06T10:00:00.000Z',
    notes: 'Treasury account payout',
  },
  {
    ownerEmail: 'analyst.ava@gmail.com',
    amount: 330,
    type: RecordType.EXPENSE,
    category: 'Training',
    date: '2026-03-09T10:00:00.000Z',
    notes: 'Finance analytics workshop',
  },
  {
    ownerEmail: 'analyst.noah@gmail.com',
    amount: 2250,
    type: RecordType.INCOME,
    category: 'Consulting',
    date: '2026-03-12T10:00:00.000Z',
    notes: 'Quarterly advisory fee',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 2500,
    type: RecordType.EXPENSE,
    category: 'Infrastructure',
    date: '2026-03-18T10:00:00.000Z',
    notes: 'Server and backup upgrades',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 10300,
    type: RecordType.INCOME,
    category: 'Salary',
    date: '2026-03-31T10:00:00.000Z',
    notes: 'Monthly salary credited',
  },
  {
    ownerEmail: 'analyst.ava@gmail.com',
    amount: 700,
    type: RecordType.EXPENSE,
    category: 'Marketing',
    date: '2026-04-02T10:00:00.000Z',
    notes: 'Paid ads refresh',
  },
  {
    ownerEmail: 'analyst.noah@gmail.com',
    amount: 1940,
    type: RecordType.INCOME,
    category: 'Services',
    date: '2026-04-07T10:00:00.000Z',
    notes: 'Support services payment',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 390,
    type: RecordType.EXPENSE,
    category: 'Security',
    date: '2026-04-12T10:00:00.000Z',
    notes: 'Security tooling renewal',
  },
  {
    ownerEmail: 'admin@gmail.com',
    amount: 9800,
    type: RecordType.INCOME,
    category: 'Salary',
    date: '2026-04-25T10:00:00.000Z',
    notes: 'Monthly salary credited',
  },
];

async function upsertUsers(): Promise<Map<string, string>> {
  const userIdByEmail = new Map<string, string>();

  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        status: user.status,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        status: user.status,
        slug: generateUserSlug(user.name),
      },
    });

    userIdByEmail.set(upserted.email, upserted.id);
  }

  return userIdByEmail;
}

async function seedRecords(userIdByEmail: Map<string, string>): Promise<void> {
  await prisma.financialRecord.deleteMany({
    where: {
      user: {
        email: {
          in: DEMO_USERS.map((u) => u.email),
        },
      },
    },
  });

  for (const [index, record] of DEMO_RECORDS.entries()) {
    const ownerId = userIdByEmail.get(record.ownerEmail);

    if (!ownerId) {
      throw new Error(`Missing owner for record seed: ${record.ownerEmail}`);
    }

    await prisma.financialRecord.create({
      data: {
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: new Date(record.date),
        notes: record.notes,
        slug: generateRecordSlug(`${record.category}-${index + 1}`, record.date),
        createdBy: ownerId,
      },
    });
  }
}

async function main(): Promise<void> {
  const userIdByEmail = await upsertUsers();
  await seedRecords(userIdByEmail);

  console.log('Seed complete');
  console.log('Admin login: admin@gmail.com / admintester1234');
  console.log(`Users seeded: ${DEMO_USERS.length}`);
  console.log(`Records seeded: ${DEMO_RECORDS.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
