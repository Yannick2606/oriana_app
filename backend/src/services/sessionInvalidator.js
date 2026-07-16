export function createSessionInvalidator(pool) {
  return async function invalidateUserSessions(userId) {
    await pool.query("DELETE FROM sessions WHERE sess->'user'->>'id' = $1", [String(userId)]);
  };
}
