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
                  サイト生成AI
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col items-center gap-8">

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
