'use client'

import { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// コードブロックを抽出する関数
function extractCodeBlocks(content: string): { language: string; code: string }[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const blocks: { language: string; code: string }[] = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'html',
      code: match[2].trim(),
    })
  }

  return blocks
}

// ZIPファイルを生成してダウンロード
async function downloadAsZip(content: string, filename: string = 'website') {
  const codeBlocks = extractCodeBlocks(content)

  if (codeBlocks.length === 0) {
    alert('コードブロックが見つかりませんでした')
    return
  }

  const zip = new JSZip()

  codeBlocks.forEach((block, index) => {
    let fileName = 'index.html'

    // ファイル名を推測
    if (block.language === 'html' || block.code.includes('<!DOCTYPE')) {
      fileName = index === 0 ? 'index.html' : `page${index}.html`
    } else if (block.language === 'css') {
      fileName = 'styles.css'
    } else if (block.language === 'javascript' || block.language === 'js') {
      fileName = 'script.js'
    } else if (block.language === 'json') {
      fileName = 'package.json'
    }

    zip.file(fileName, block.code)
  })

  // README.mdを追加
  zip.file('README.md', `# ${filename}\n\nAIによって生成されたWebサイトです。\n\n## 使い方\n\n1. index.htmlをブラウザで開く\n2. または、ローカルサーバーで起動する\n\n生成日時: ${new Date().toLocaleString('ja-JP')}`)

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${filename}.zip`)
}

export default function AIChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！Webサイト生成AIアシスタントです。\n\n作りたいサイトやUIコンポーネントを教えてください。HTML/CSS/JavaScriptで実装します！\n\n例：\n・「シンプルなランディングページを作って」\n・「レスポンシブなナビゲーションバーが欲しい」\n・「おしゃれなカードデザインを生成して」',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // 会話履歴を構築（最新10件のみ送信してコスト削減）
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API呼び出しに失敗しました')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error calling AI API:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `エラーが発生しました: ${error.message || '不明なエラー'}。OpenAI APIキーが設定されているか確認してください。`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter (Mac) または Ctrl+Enter (Windows/Linux) で送信
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl border-2 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5577] to-[#ff6688] text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Webサイト生成AI</h3>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#FF5577] to-[#ff6688] text-white'
                  : 'bg-white text-[#0E2D5A] border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

              {/* AIメッセージにコードブロックがある場合、ダウンロードボタンを表示 */}
              {message.role === 'assistant' && message.content.includes('```') && (
                <button
                  onClick={() => downloadAsZip(message.content, 'ai-generated-site')}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-[#0AA3D5] to-[#0099cc] text-white text-xs font-medium rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ZIPでダウンロード
                </button>
              )}

              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#0AA3D5] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-[#0AA3D5] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-[#0AA3D5] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <p className="text-sm text-gray-500">入力中...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 p-4 bg-white border-t border-gray-100">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Cmd+Enterで送信)"
          rows={1}
          className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5577] disabled:bg-gray-50 transition-colors text-[#0E2D5A] resize-none"
          disabled={isLoading}
          style={{ minHeight: '48px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = Math.min(target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-8 py-3 bg-gradient-to-r from-[#FF5577] to-[#ff6688] text-white rounded-full hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-medium self-end"
        >
          {isLoading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  )
}
