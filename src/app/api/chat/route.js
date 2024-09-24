import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText } from 'ai'
import { Ratelimit } from '@upstash/ratelimit';
import kv from '@vercel/kv';

const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.fixedWindow(2, '60s'),
});

export async function POST(request) {
    const ip = request.ip ?? 'ip';
    const { success, remaining } = await ratelimit.limit(ip);
    console.log(remaining)
    console.log(success)
    if (!success) {
      return new Response('Limite de mensagens atingido!', { status: 429 });
    }

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

    return result.toDataStreamResponse({
        getErrorMessage: (error) => {

            if (error == null) {
                console.error('[POST] :: toDataStreamResponse - erro chegou nulo e não sabemos o que houve.')
                return "Algum erro inesperado aconteceu!"
            }

            if (typeof error == 'string') {
                console.error('[POST] :: toDataStreamResponse - erro chegou nulo e não sabemos o que houve.', error)
                return error
            }

            if (typeof error == Error) {
                return error.message;
            }

            return JSON.stringify(error)
        }
    })
}