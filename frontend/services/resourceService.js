import { apiClient } from "./apiClient";

export const resourceService = Object.freeze({
  async list(resource, params) { const { data } = await apiClient.get(`/${resource}`, { params }); return { items: data.data, meta: data.meta }; },
  async get(resource, id) { const { data } = await apiClient.get(`/${resource}/${id}`); return data.data; },
  async create(resource, values) { const { data } = await apiClient.post(`/${resource}`, values); return data.data; },
  async update(resource, id, values) { const { data } = await apiClient.patch(`/${resource}/${id}`, values); return data.data; },
  async remove(resource, id) { await apiClient.delete(`/${resource}/${id}`); },
  async restore(resource, id) { const { data } = await apiClient.post(`/${resource}/${id}/restore`); return data.data; },
  async bulkRemove(resource, ids) { const { data } = await apiClient.post(`/${resource}/bulk-delete`, { ids }); return data.data; },
  async convertLead(id) { const { data } = await apiClient.post(`/leads/${id}/convert`); return data.data; },
  async featureProperty(id, featured) { const { data } = await apiClient.patch(`/properties/${id}/feature`, { featured }); return data.data; },
  async bookingAction(id, action) { const { data } = await apiClient.patch(`/bookings/${id}/${action}`); return data.data; },
  async leadPipeline() { const { data } = await apiClient.get("/leads/pipeline"); return data.data; },
});
