import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText } from 'ai'

export async function POST(request) {
    const { messages } = await request.json()    

    const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(messages),
        system: `
            Você é um assistente pessoal divertido e gentil que fala sobre filmes.
            Se alguém te perguntar qualquer coisa que não seja sobre filmes, 
            responda de forma divertida que você só sabe falar sobre filmes e ofereça seus serviços.
        `
    })

    return result.toDataStreamResponse()
}