import { Schema, Aggregate } from "mongoose";

export function applySoftDelete(schema: Schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  });

  schema.index({ userId: 1, isDeleted: 1 });

  // Covers find, findOne, findOneAndUpdate, findOneAndDelete, countDocuments, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema.pre(/^find/, function (this: any) {
    const filter = this.getFilter();
    if (!Object.prototype.hasOwnProperty.call(filter, "isDeleted")) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  // Aggregation pipelines don't go through query middleware, so handle them
  // separately: if the pipeline's first $match doesn't already mention
  // isDeleted, inject one at the front.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema.pre<Aggregate<any>>("aggregate", function () {
    const pipeline = this.pipeline();
    const firstStage = pipeline[0] as { $match?: Record<string, unknown> } | undefined;
    const alreadyFiltered = !!firstStage?.$match && "isDeleted" in firstStage.$match;

    if (!alreadyFiltered) {
      pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
    }
  });
}
