import { escapeRegExp, buildSort } from "../utils/queryBuilder.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";

export class ResourceRepository {
  constructor(resource) { this.resource = resource; }
  scope(auth, includeDeleted = false) { return { organization: auth.user.organization || null, ...(includeDeleted ? {} : { deletedAt: null }) }; }
  async list(auth, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = this.scope(auth);
    if (query.status) filter.status = query.status;
    if (query.search && this.resource.searchFields.length) { const expression = new RegExp(escapeRegExp(query.search), "i"); filter.$or = this.resource.searchFields.map((field) => ({ [field]: expression })); }
    const sort = buildSort(query.sort, this.resource.sortFields);
    let cursor = this.resource.model.find(filter).sort(sort).skip(skip).limit(limit).maxTimeMS(5000).lean();
    for (const path of this.resource.populate) cursor = cursor.populate(path);
    const [items, total] = await Promise.all([cursor.exec(), this.resource.model.countDocuments(filter).maxTimeMS(5000)]);
    return { items, meta: paginationMeta({ page, limit, total }) };
  }
  async find(auth, id) { let query = this.resource.model.findOne({ ...this.scope(auth), _id: id }); for (const path of this.resource.populate) query = query.populate(path); return query; }
  create(auth, data) { return this.resource.model.create({ ...data, organization: auth.user.organization || null, createdBy: auth.userId, updatedBy: auth.userId }); }
  update(auth, id, data) { return this.resource.model.findOneAndUpdate({ ...this.scope(auth), _id: id }, { $set: { ...data, updatedBy: auth.userId } }, { new: true, runValidators: true }); }
  remove(auth, id) { return this.resource.model.findOneAndUpdate({ ...this.scope(auth), _id: id }, { $set: { deletedAt: new Date(), deletedBy: auth.userId, updatedBy: auth.userId } }, { new: true }); }
  restore(auth, id) { return this.resource.model.findOneAndUpdate({ ...this.scope(auth, true), _id: id, deletedAt: { $ne: null } }, { $set: { deletedAt: null, deletedBy: null, updatedBy: auth.userId } }, { new: true }); }
  bulkRemove(auth, ids) { return this.resource.model.updateMany({ ...this.scope(auth), _id: { $in: ids } }, { $set: { deletedAt: new Date(), deletedBy: auth.userId, updatedBy: auth.userId } }); }
  bulkUpdate(auth, ids, data) { return this.resource.model.updateMany({ ...this.scope(auth), _id: { $in: ids } }, { $set: { ...data, updatedBy: auth.userId } }, { runValidators: true }); }
}
