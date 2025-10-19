import { Schema, model, models, Document, Types } from "mongoose";

export interface IStyleProfile extends Document {
  user: Types.ObjectId;
  averagePromptLength: number;
  frequentWords: string[];
  categoryDistribution: Map<string, number>;
  difficultyDistribution: Map<string, number>;
  lastUpdated: Date;
  embeddings: number[];
}

const StyleProfileSchema = new Schema<IStyleProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    averagePromptLength: { type: Number, default: 0 },
    frequentWords: { type: [String], default: [] },
    categoryDistribution: { type: Map, of: Number, default: {} },
    difficultyDistribution: { type: Map, of: Number, default: {} },
    lastUpdated: { type: Date, default: Date.now },
    embeddings: { type: [Number], default: [] },
  },
  { timestamps: true }
);

const StyleProfile = models.StyleProfile || model<IStyleProfile>("StyleProfile", StyleProfileSchema);
export default StyleProfile;
