import pg from 'pg';

pg.types.setTypeParser(20, (value) => Number(value));
pg.types.setTypeParser(1700, (value) => Number(value));

function readPostgresConfig(environment = process.env) {
  const config = {
    host: environment.POSTGRES_HOST,
    port: Number(environment.POSTGRES_PORT || 5432),
    database: environment.POSTGRES_DB,
    user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
  };
  const missing = ['host', 'database', 'user', 'password'].filter((key) => !config[key]);
  if (missing.length > 0) throw new Error(`Configuration PostgreSQL incomplète : ${missing.join(', ')}`);
  return { ...config, max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 };
}

export function createPostgresPool(environment = process.env) {
  return new pg.Pool(readPostgresConfig(environment));
}

export const testing = { readPostgresConfig };
