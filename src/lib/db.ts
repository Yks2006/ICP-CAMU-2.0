import mysql from "mysql2/promise";
import { verifyPassword } from "@/lib/password";

const globalForDb = globalThis as typeof globalThis & {
  mysqlPool?: mysql.Pool;
};

export const INSTITUTION_NAME = "University of Wollongong Malaysia";

export function getPool() {
  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = mysql.createPool({
      host: process.env.DATABASE_HOST ?? "127.0.0.1",
      port: Number(process.env.DATABASE_PORT ?? 3306),
      user: process.env.DATABASE_USER ?? "root",
      password: process.env.DATABASE_PASSWORD ?? "",
      database: process.env.DATABASE_NAME ?? "camu_portal",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return globalForDb.mysqlPool;
}

export type StudentStatus = "Active" | "Inactive" | "Suspended" | "Graduated";

export type DbUser = {
  id: number;
  student_id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  role: "student" | "admin";
  student_status: StudentStatus;
  degree_level: string;
  department: string;
  program_name: string;
  institution: string;
  password_set_at: Date | null;
};

function mapUser(row: mysql.RowDataPacket): DbUser {
  return {
    id: row.id as number,
    student_id: row.student_id as string,
    email: row.email as string,
    password_hash: (row.password_hash as string | null) ?? null,
    full_name: row.full_name as string,
    role: row.role as "student" | "admin",
    student_status: row.student_status as StudentStatus,
    degree_level: row.degree_level as string,
    department: row.department as string,
    program_name: row.program_name as string,
    institution: row.institution as string,
    password_set_at: (row.password_set_at as Date | null) ?? null,
  };
}

const USER_COLUMNS = `
  id, student_id, email, password_hash, full_name, role,
  student_status, degree_level, department, program_name, institution, password_set_at
`;

export function userNeedsPasswordSetup(user: DbUser): boolean {
  return !user.password_hash || user.password_hash.trim() === "";
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const pool = getPool();
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email.trim().toLowerCase()],
  );

  if (!rows.length) {
    return null;
  }

  return mapUser(rows[0]);
}

export async function findUserByStudentId(studentId: string): Promise<DbUser | null> {
  const pool = getPool();
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE student_id = ?
     LIMIT 1`,
    [studentId.trim().toUpperCase()],
  );

  if (!rows.length) {
    return null;
  }

  return mapUser(rows[0]);
}

export async function createStudentByAdmin(input: {
  studentId: string;
  email: string;
  fullName: string;
  studentStatus: StudentStatus;
  degreeLevel: string;
  department: string;
  programName: string;
  institution: string;
}) {
  const pool = getPool();
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO users (
      student_id, email, password_hash, full_name, role,
      student_status, degree_level, department, program_name, institution
    ) VALUES (?, ?, NULL, ?, 'student', ?, ?, ?, ?, ?)`,
    [
      input.studentId.trim().toUpperCase(),
      input.email.trim().toLowerCase(),
      input.fullName.trim(),
      input.studentStatus,
      input.degreeLevel.trim(),
      input.department.trim(),
      input.programName.trim(),
      input.institution.trim(),
    ],
  );

  return result.insertId;
}

export async function setUserPassword(email: string, passwordHash: string) {
  const pool = getPool();
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `UPDATE users
     SET password_hash = ?, password_set_at = CURRENT_TIMESTAMP
     WHERE email = ? AND (password_hash IS NULL OR password_hash = '')`,
    [passwordHash, email.trim().toLowerCase()],
  );

  return result.affectedRows > 0;
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || userNeedsPasswordSetup(user)) {
    return null;
  }

  if (!verifyPassword(password, user.password_hash!)) {
    return null;
  }

  return user;
}
