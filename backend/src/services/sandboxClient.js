function clone(value) {
  return globalThis.structuredClone(value);
}

function matches(actual, expectedValues) {
  const actualValues = Array.isArray(actual)
    ? actual.filter((value) => value !== 'L')
    : [actual];
  return expectedValues.some((expected) => actualValues.some(
    (value) => String(value) === String(expected),
  ));
}

async function readOnly() {
  throw new Error('SANDBOX_READ_ONLY');
}

export function createSandboxClient(data, { authEmail } = {}) {
  const tables = new Map(Object.entries(clone(data.tables)));
  const users = tables.get('Utilisateurs') ?? [];
  const previewAccount = users.find((user) => user.id === 1001);
  if (previewAccount) {
    previewAccount.fields.email = authEmail;
    previewAccount.fields.roles = [
      'L',
      'consultant',
      'master_consultant',
      'directeur_agence',
      'admin_agence',
      'super_admin',
    ];
    previewAccount.fields.role = previewAccount.fields.roles;
  }

  return {
    async list(table, filters = {}) {
      const records = tables.get(table) ?? [];
      const entries = Object.entries(filters);
      return clone(records.filter((record) => entries.every(([field, expected]) => {
        const expectedValues = Array.isArray(expected) ? expected : [expected];
        return matches(record.fields[field], expectedValues);
      })));
    },

    async getById(table, id) {
      const record = (tables.get(table) ?? [])
        .find((candidate) => candidate.id === Number(id));
      return record ? clone(record) : null;
    },

    create: readOnly,
    update: readOnly,
    delete: readOnly,
  };
}
