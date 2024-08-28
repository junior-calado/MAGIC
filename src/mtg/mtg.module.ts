import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MtgController } from './mtg.controller';
import { MtgService } from './mtg.service';
import { Schema } from 'mongoose';

const DeckSchema = new Schema({
  commander: Object,
  deck: [Object],
});

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Deck', schema: DeckSchema }])],
  controllers: [MtgController],
  providers: [MtgService],
})
export class MtgModule { }
