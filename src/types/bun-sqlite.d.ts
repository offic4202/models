declare module "bun:sqlite" {
  export class Database {
    constructor(filename: string);
    query<T = any>(sql: string): Query<T>;
    exec(sql: string): void;
    pragma(pragma: string): any;
    close(): void;
  }

  export class Query<T> {
    all(...params: any[]): T[];
    get(...params: any[]): T | undefined;
    run(...params: any[]): RunResult;
  }

  export interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }
}
