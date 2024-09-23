import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText } from 'ai'

export async function POST(request) {
    const { messages } = await request.json()    

    const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(messages)
    })

    return result.toDataStreamResponse()
}