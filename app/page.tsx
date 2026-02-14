'use client'

import { useState } from 'react'
import AIChatWindow from '@/components/AIChatWindow'
import FilePreview from '@/components/FilePreview'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Hanamii AIアシスタント デモ
          </h1>

          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'chat'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  AIチャット
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'preview'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ファイルプレビュー
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'chat' && (
                <div className="flex justify-center">
                  <AIChatWindow />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="flex justify-center">
                  <FilePreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
