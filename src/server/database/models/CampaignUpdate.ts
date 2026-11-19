import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaignUpdateDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  imageUrl?: string;
  isPublicVisible: boolean;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignUpdateSchema = new Schema<ICampaignUpdateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    isPublicVisible: { type: Boolean, default: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CampaignUpdateSchema.index({ organizationId: 1, campaignId: 1, createdAt: -1 });

export const CampaignUpdate: Model<ICampaignUpdateDocument> =
  mongoose.models.CampaignUpdate ||
  mongoose.model<ICampaignUpdateDocument>('CampaignUpdate', CampaignUpdateSchema);

export default CampaignUpdate;
