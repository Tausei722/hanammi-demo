'use client'

import { useState } from 'react'
import AIChatWindow from '@/components/AIChatWindow'
import FilePreview from '@/components/FilePreview'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-[70px]">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-[#FF5577]">
                Hanamii AI
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-[#FF5577]'
                      : 'text-foreground hover:text-[#FF5577]'
                  }`}
                >
                  AIチャット
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-[#FF5577]'
                      : 'text-foreground hover:text-[#FF5577]'
                  }`}
                >
                  ファイルプレビュー
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden md:block px-6 py-2 text-sm font-medium text-foreground hover:text-[#FF5577] transition-colors rounded-full">
                ログイン
              </button>
              <button className="px-6 py-2 text-sm font-medium bg-[#FF5577] text-white hover:bg-[#ff4466] transition-colors rounded-full">
                無料で始める
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              AIと共に創る
              <span className="block mt-2 bg-gradient-to-r from-[#FF5577] via-[#0AA3D5] to-[#EA9D05] bg-clip-text text-transparent">
                次世代の開発体験
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              AIアシスタントとファイルプレビューで、開発をもっとスムーズに
            </p>
          </div>

          {/* Tab Content */}
          <div className="w-full flex justify-center">
            {activeTab === 'chat' && <AIChatWindow />}
            {activeTab === 'preview' && <FilePreview />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 Hanamii AI デモ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
