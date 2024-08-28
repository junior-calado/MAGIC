import mongoose, { Schema, Document } from 'mongoose';

export interface Deck extends Document {
  sequentialId: number;
  commander: any;
  deck: any[];
}

export const DeckSchema = new Schema({
  sequentialId: { type: Number, required: true, unique: true },
  commander: { type: Schema.Types.Mixed, required: true },
  deck: { type: [Schema.Types.Mixed], required: true },
});

export const DeckModel = mongoose.model<Deck>('Deck', DeckSchema);
