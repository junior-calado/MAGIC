import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MtgController } from './mtg/mtg.controller';
import { MtgService } from './mtg/mtg.service';
import { DeckSchema } from './mtg/models/deck.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/MAGIC'), 
    MongooseModule.forFeature([{ name: 'Deck', schema: DeckSchema }]),
  ],
  controllers: [MtgController],
  providers: [MtgService],
})
export class AppModule {}
