import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { MtgService } from './mtg.service';

@Controller('mtg')
export class MtgController {
    constructor(private readonly mtgService: MtgService) { }

    @Post('generate-deck')
    async generateDeck() {
        const commander = await this.mtgService.getRandomCommander();
        const commanderColors = commander.colors;
        const deckCards = await this.mtgService.get99CardsByColor(commanderColors);
        const fullDeck = {
            commander,
            deck: deckCards,
        };

        return fullDeck;
    }

    @Post('save-deck')
    async saveDeck() {
        const fullDeck = await this.generateDeck();
        const savedDeck = await this.mtgService.saveDeckToDatabase(fullDeck);
        return { message: 'Deck salvo no banco de dados', deck: savedDeck };
    }

    @Post('save-deck-file')
    async saveDeckToFile() {
        const fullDeck = await this.generateDeck();
        await this.mtgService.saveDeckToFile(fullDeck);
        return { message: 'Deck salvo em deck.json', deck: fullDeck };
    }

    @Get('deck/:sequentialId')
    async getDeck(@Param('sequentialId') sequentialId: number) {
        const deck = await this.mtgService.getDeckById(sequentialId);
        if (!deck) {
            return { message: 'Deck não encontrado' };
        }
        return { deck };
    }

    @Get('decks')
    async getDeckById() {
        const decks = await this.mtgService.getAllDecks();
        return { decks };
    }

    @Delete('delete-deck/:sequentialId')
    async deleteDeck(@Param('sequentialId') sequentialId: number) {
        const result = await this.mtgService.deleteDeckById(sequentialId);
        if (!result) {
            return { message: 'Deck não encontrado' };
        }
        return { message: 'Deck excluído com sucesso' };
    }
}
