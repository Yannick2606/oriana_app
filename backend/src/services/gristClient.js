function readConfig() {
  const config = {
    apiUrl: process.env.GRIST_API_URL,
    apiKey: process.env.GRIST_API_KEY,
    docId: process.env.GRIST_DOC_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Configuration Grist incomplète : ${missing.join(', ')}`);
  }

  return config;
}

function createClient(config, fetchImplementation = fetch) {
  const baseUrl = `${config.apiUrl.replace(/\/$/, '')}/api/docs/${encodeURIComponent(config.docId)}`;

  async function request(path, options = {}) {
    const response = await fetchImplementation(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur Grist (${response.status})`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  function tablePath(table) {
    return `/tables/${encodeURIComponent(table)}/records`;
  }

  return {
    async list(table, filters = {}) {
      const query = Object.keys(filters).length > 0
        ? `?filter=${encodeURIComponent(JSON.stringify(filters))}`
        : '';
      const result = await request(`${tablePath(table)}${query}`);
      return result.records;
    },

    async getById(table, id) {
      return request(`${tablePath(table)}/${encodeURIComponent(id)}`);
    },

    async create(table, data) {
      const result = await request(tablePath(table), {
        method: 'POST',
        body: JSON.stringify({ records: [{ fields: data }] }),
      });
      return result.records[0];
    },

    async update(table, id, data) {
      const result = await request(tablePath(table), {
        method: 'PATCH',
        body: JSON.stringify({ records: [{ id, fields: data }] }),
      });
      return result.records[0];
    },

    async delete(table, id) {
      await request(`${tablePath(table)}/delete`, {
        method: 'POST',
        body: JSON.stringify([id]),
      });
      return null;
    },

    async listTables() {
      const result = await request('/tables');
      return result.tables;
    },

    async listColumns(table) {
      const result = await request(`/tables/${encodeURIComponent(table)}/columns`);
      return result.columns;
    },

    async createTables(tables) {
      return request('/tables', {
        method: 'POST',
        body: JSON.stringify({ tables }),
      });
    },

    async addOrUpdateColumns(table, columns) {
      return request(`/tables/${encodeURIComponent(table)}/columns?noupdate=true`, {
        method: 'PUT',
        body: JSON.stringify({ columns }),
      });
    },
  };
}

function client() {
  return createClient(readConfig());
}

export const gristClient = {
  list: (...argumentsList) => client().list(...argumentsList),
  getById: (...argumentsList) => client().getById(...argumentsList),
  create: (...argumentsList) => client().create(...argumentsList),
  update: (...argumentsList) => client().update(...argumentsList),
  delete: (...argumentsList) => client().delete(...argumentsList),
  listTables: (...argumentsList) => client().listTables(...argumentsList),
  listColumns: (...argumentsList) => client().listColumns(...argumentsList),
  createTables: (...argumentsList) => client().createTables(...argumentsList),
  addOrUpdateColumns: (...argumentsList) => client().addOrUpdateColumns(...argumentsList),
};

export const testing = { createClient };
