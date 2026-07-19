export function createPersistenceDouble() {
  return {
    async list() { return []; },
    async getById() { return null; },
    async create() { return null; },
    async update() { return null; },
    async delete() {},
  };
}
