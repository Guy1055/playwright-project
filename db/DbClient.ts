import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';

/**
 * PLACEHOLDER TIER. The public demo exposes no database, so these checks only run against a
 * self-hosted Toolshop (its docker-compose ships MariaDB). Point DB_URL, API_URL and BASE_URL there.
 */
export class DbClient {
  private constructor(private readonly connection: Connection) {}

  static async connect(url: string): Promise<DbClient> {
    return new DbClient(await mysql.createConnection(url));
  }

  async query<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(sql, params);
    return rows as T[];
  }

  async close() {
    await this.connection.end();
  }
}
