/**
 * Dev seed: a few pending timesheets so the manager review queue has something
 * real to act on. Safe to re-run - it clears only the rows it created.
 *
 *   node prisma/seed_timesheets.js
 */
const { createClient } = require('@libsql/client');

const db = createClient({ url: process.env.DATABASE_URL || 'file:./dev.db' });

const SEED_PREFIX = 'seed-ts-';

async function main() {
  const submitter = await db.execute({
    sql: 'select id, name from User where email = ?',
    args: ['sarah@caring.com'],
  });
  if (!submitter.rows.length) throw new Error('sarah@caring.com not found');
  const submitterId = submitter.rows[0].id;

  // Route to the tags the submitter carries, so whichever manager shares a tag
  // with them sees these in their queue.
  const tags = await db.execute({
    sql: 'select T.id, T.name from Tag T join _UserTags UT on UT.A = T.id where UT.B = ?',
    args: [submitterId],
  });
  if (!tags.rows.length) throw new Error('submitter has no tags to route by');

  // Clear previous seed rows.
  await db.execute({
    sql: `delete from _TimesheetTagApprovers where B in (select id from Timesheet where id like ?)`,
    args: [SEED_PREFIX + '%'],
  });
  await db.execute({ sql: 'delete from Timesheet where id like ?', args: [SEED_PREFIX + '%'] });

  const rows = [
    { d: '2026-09-01', in: '08:00', out: '16:30', lunch: 0.5, ot: 0, total: 8 },
    { d: '2026-09-02', in: '07:30', out: '18:00', lunch: 1.0, ot: 1.5, total: 9.5 },
    { d: '2026-08-31', in: '09:00', out: '17:00', lunch: 0.5, ot: 0, total: 7.5 },
  ];

  const now = new Date().toISOString();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const id = SEED_PREFIX + (i + 1);
    await db.execute({
      sql: `insert into Timesheet
              (id, submitterId, date, timeIn, timeOut, lunchHour, overTime, transferTime,
               totalHours, status, createdAt, updatedAt)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      args: [id, submitterId, new Date(r.d).toISOString(), r.in, r.out, r.lunch, r.ot, 0, r.total, now, now],
    });
    for (const tag of tags.rows) {
      await db.execute({
        sql: 'insert into _TimesheetTagApprovers (A, B) values (?, ?)',
        args: [tag.id, id],
      });
    }
  }

  console.log(
    'Seeded ' + rows.length + ' pending timesheets for ' + (submitter.rows[0].name || submitterId) +
    ', routed to: ' + tags.rows.map(t => t.name).join(', ')
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
