export function createSandboxController(service) {
  return {
    getOffersDataset(request, response) {
      return response.status(200).json({ data: service.getOffersDataset() });
    },
  };
}
