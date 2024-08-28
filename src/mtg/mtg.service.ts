import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deck } from './models/deck.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MtgService {
    private readonly apiUrl = 'https://api.scryfall.com/cards/search';

    constructor(
        @InjectModel('Deck') private readonly deckModel: Model<Deck>,
    ) { }

    // Método para buscar um comandante aleatório
    async getRandomCommander(): Promise<any> {
        const response = await axios.get(this.apiUrl, {
            params: { q: 'type:legendary type:creature', order: 'edhrec', unique: 'prints', page: Math.floor(Math.random() * 100) + 1 },
        });
        const commanders = response.data.data;
        const randomIndex = Math.floor(Math.random() * commanders.length);
        return commanders[randomIndex];
    }

    // Método para buscar cartas aleatórias baseadas na cor do comandante
    async get99CardsByColor(colors: string[]): Promise<any[]> {
        if (!colors || colors.length === 0) {
            throw new Error('Cores do comandante não fornecidas.');
        }

        const colorQuery = colors.map(color => `color:${color}`).join(' OR ');
        let cards: any[] = [];
        let page = 1;

        try {
            while (cards.length < 99) {
                const response = await axios.get(this.apiUrl, {
                    params: { q: `(${colorQuery})`, order: 'edhrec', unique: 'prints', page: page++ },
                });

                // Adiciona um log para verificar a resposta
                console.log('Response Data:', response.data);

                if (!response.data || !response.data.data) {
                    throw new Error('Resposta da API não contém dados.');
                }

                const newCards = response.data.data.filter(card =>
                    !cards.some(existingCard => existingCard.id === card.id) ||
                    card.type_line.includes('Basic Land')
                );

                cards = cards.concat(newCards);

                if (response.data.has_more === false) {
                    break;
                }
            }

            // Embaralha e retorna apenas 99 cartas
            return this.shuffleArray(cards).slice(0, 99);
        } catch (error) {
            console.error('Erro ao buscar cartas:', error.message);
            throw error;
        }
    }

    // Método para embaralhar um array
    private shuffleArray(array: any[]): any[] {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    // Método para obter o próximo ID sequencial
    private async getNextSequentialId(): Promise<number> {
        const lastDeck = await this.deckModel.findOne().sort('-sequentialId').exec();
        return lastDeck ? lastDeck.sequentialId + 1 : 1;
    }

    // Método para salvar um deck no banco de dados
    async saveDeckToDatabase(deck: any): Promise<any> {
        const sequentialId = await this.getNextSequentialId();
        const createdDeck = new this.deckModel({ ...deck, sequentialId });
        return createdDeck.save();
    }

    // Método para buscar todos os decks
    async getAllDecks(): Promise<Deck[]> {
        return this.deckModel.find().exec();
    }

    // Método para encontrar um deck no banco de dados pelo ID sequencial
    async getDeckById(sequentialId: number): Promise<any> {
        return this.deckModel.findOne({ sequentialId }).exec();
    }

    // Método para excluir um deck no banco de dados pelo ID sequencial
    async deleteDeckById(sequentialId: number): Promise<any> {
        return this.deckModel.findOneAndDelete({ sequentialId }).exec();
    }

    // Método para salvar um deck em um arquivo JSON
    async saveDeckToFile(deck: any): Promise<void> {
        try {
            // Defina o caminho do arquivo JSON na raiz do projeto
            const filePath = path.resolve(process.cwd(), 'deck.json');

            // Verifique se o diretório existe e crie-o se não existir
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Escreve o conteúdo JSON no arquivo
            fs.writeFileSync(filePath, JSON.stringify(deck, null, 2), 'utf-8');
            console.log(`Deck salvo em ${filePath}`);
        } catch (error) {
            console.error('Erro ao salvar o deck em arquivo JSON:', error);
        }
    }
}
