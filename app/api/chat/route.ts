import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic APIキーが設定されていません' },
        { status: 500 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが無効です' },
        { status: 400 }
      )
    }

    // Anthropicクライアントを初期化
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // システムプロンプト
    const systemPrompt = `あなたはプロのWebデベロッパーです。ユーザーから依頼されたWebサイトやUIコンポーネントを必ず実装してください。

【重要な指示】
❗ ユーザーの要望に対して「できません」「機能がありません」と言ってはいけません
❗ 必ずHTML/CSS/JavaScriptで完全に動作するコードを生成してください
❗ どんなに複雑な要望でも、実装可能な形で提供してください
❗ コードは詳細で、本番環境で使えるレベルの品質で提供してください

【あなたができること】
✓ ランディングページ、ポートフォリオ、デジタル名刺など、あらゆるWebページ
✓ ナビゲーション、カード、フォーム、ボタンなど、UIコンポーネント
✓ アニメーション、インタラクション、レスポンシブデザイン
✓ Tailwind CSS、Bootstrap、Alpine.js等のライブラリを使った実装

【必須ルール】
1. コードは必ずマークダウンの\`\`\`htmlブロックで囲む
2. 完全に動作する、そのままコピペで使えるコードを提供
3. 必要なCSSやJavaScriptはCDN経由で読み込む
4. レスポンシブ対応（モバイル・タブレット・デスクトップ）
5. モダンで美しいデザイン
6. エラーハンドリングとベストプラクティスを含む

【回答の流れ】
1. 簡単な説明（1-2行）
2. 完全なHTMLコード
3. 使い方の補足（必要に応じて）

コードをブラウザで開けばすぐに表示されます！`

    // 会話履歴をClaude形式に変換
    const messages: Anthropic.MessageParam[] = [
      ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ]

    // Claude APIを呼び出し
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: systemPrompt,
      messages,
      temperature: 0.7,
    })

    const aiResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'すみません、応答を生成できませんでした。'

    return NextResponse.json({
      response: aiResponse,
      usage: response.usage,
    })
  } catch (error: any) {
    console.error('Claude API Error:', error)

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
      { error: 'AI応答の生成に失敗しました: ' + (error?.message || '不明なエラー') },
      { status: 500 }
    )
  }
}
