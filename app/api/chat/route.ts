import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが無効です' },
        { status: 400 }
      )
    }

    // 会話履歴を構築
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'あなたは親切で役立つAIアシスタントです。日本語で丁寧に回答してください。',
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ]

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。'

    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('OpenAI API Error:', error)

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'APIキーが無効です' },
        { status: 401 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'レート制限に達しました。しばらく待ってから再度お試しください' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'AI応答の生成に失敗しました' },
      { status: 500 }
    )
  }
}
