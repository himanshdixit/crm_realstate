import { ApiError } from "../utils/ApiError.js";
import { paginationMeta, parsePagination } from "../utils/pagination.js";
import { buildSort } from "../utils/queryBuilder.js";

export class BaseRepository {
  constructor(model, { sortableFields = ["createdAt", "updatedAt"] } = {}) {
    this.model = model;
    this.sortableFields = sortableFields;
  }

  async findById(id, { includeDeleted = false, populate = [] } = {}) {
    const filter = { _id: id, ...(includeDeleted ? {} : { deletedAt: null }) };
    let query = this.model.findOne(filter);
    for (const path of populate) query = query.populate(path);
    return query.exec();
  }

  async findByIdOrFail(id, options) {
    const document = await this.findById(id, options);
    if (!document) throw new ApiError(404, `${this.model.modelName} was not found`, "RESOURCE_NOT_FOUND");
    return document;
  }

  async list({ query = {}, filter = {}, projection = null, populate = [] } = {}) {
    const { page, limit, skip } = parsePagination(query);
    const finalFilter = { deletedAt: null, ...filter };
    const sort = buildSort(query.sort, this.sortableFields);
    let cursor = this.model.find(finalFilter, projection).sort(sort).skip(skip).limit(limit).lean();
    for (const path of populate) cursor = cursor.populate(path);
    const [items, total] = await Promise.all([cursor.exec(), this.model.countDocuments(finalFilter)]);
    return { items, meta: paginationMeta({ page, limit, total }) };
  }

  create(data) {
    return this.model.create(data);
  }

  async updateById(id, changes, actorId) {
    const document = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { ...changes, updatedBy: actorId } },
      { new: true, runValidators: true },
    );
    if (!document) throw new ApiError(404, `${this.model.modelName} was not found`, "RESOURCE_NOT_FOUND");
    return document;
  }

  async softDeleteById(id, actorId) {
    const document = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), deletedBy: actorId, updatedBy: actorId } },
      { new: true },
    );
    if (!document) throw new ApiError(404, `${this.model.modelName} was not found`, "RESOURCE_NOT_FOUND");
    return document;
  }
}
