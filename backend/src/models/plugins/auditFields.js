export function auditFields(schema) {
  schema.add({
    createdBy: { type: schema.base.Types.ObjectId, ref: "User", default: null, index: true },
    updatedBy: { type: schema.base.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: schema.base.Types.ObjectId, ref: "User", default: null },
  });

  schema.query.notDeleted = function notDeleted() {
    return this.where({ deletedAt: null });
  };
}
