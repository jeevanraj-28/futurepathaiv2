/**
 * Removes accounts created by automated tests (any email on the reserved
 * @futurepath.test domain) together with the rows that only reference them by id.
 * Usage: npm run cleanup:test-users
 */
import { PrismaClient } from '@prisma/client';

const TEST_DOMAIN = '@futurepath.test';
const prisma = new PrismaClient();

const main = async () => {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: TEST_DOMAIN } },
    select: { id: true, studentProfile: { select: { id: true } } },
  });
  const userIds = users.map((u) => u.id);
  const studentIds = users.flatMap((u) => (u.studentProfile ? [u.studentProfile.id] : []));

  await prisma.$transaction([
    prisma.studentInvite.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.taskCompletion.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.assessmentFeedback.deleteMany({ where: { studentId: { in: studentIds } } }),
    // profiles, enrollments, links, bookings and plans cascade from the user
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);
  console.log(`Removed ${userIds.length} test account(s).`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
