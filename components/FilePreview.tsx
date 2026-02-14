'use client'

import { useState, useCallback } from 'react'
import JSZip from 'jszip'

interface FileEntry {
  name: string
  path: string
  content: string | ArrayBuffer
  type: 'html' | 'css' | 'js' | 'json' | 'image' | 'other'
}

export default function FilePreview() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getFileType = (filename: string): FileEntry['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'html' || ext === 'htm') return 'html'
    if (ext === 'css') return 'css'
    if (ext === 'js') return 'js'
    if (ext === 'json') return 'json'
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image'
    return 'other'
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.zip')) {
      showToast('ZIPファイルを選択してください', 'error')
      return
    }

    try {
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)
      const extractedFiles: FileEntry[] = []

      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue

        const type = getFileType(path)
        let content: string | ArrayBuffer

        if (type === 'image') {
          content = await zipEntry.async('arraybuffer')
        } else {
          content = await zipEntry.async('text')
        }

        extractedFiles.push({
          name: path.split('/').pop() || path,
          path,
          content,
          type,
        })
      }

      setFiles(extractedFiles)

      const indexFile = extractedFiles.find(f => f.name === 'index.html')
      if (indexFile) {
        handleFileSelect(indexFile, extractedFiles)
      }

      showToast(`${extractedFiles.length}個のファイルを読み込みました`, 'success')
    } catch (error) {
      showToast('ZIPファイルの解凍に失敗しました', 'error')
    }
  }, [])

  const handleFileSelect = (file: FileEntry, fileList: FileEntry[] = files) => {
    setSelectedFile(file)

    if (file.type === 'html') {
      let htmlContent = file.content as string

      fileList.forEach(f => {
        if (f.type === 'css' || f.type === 'js') {
          const fileName = f.path.split('/').pop()
          if (fileName) {
            htmlContent = htmlContent.replace(
              new RegExp(`(['"])(.*/)?${fileName}\\1`, 'g'),
              `$1data:text/${f.type === 'css' ? 'css' : 'javascript'};base64,${btoa(f.content as string)}$1`
            )
          }
        }
      })

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } else if (file.type === 'image') {
      const arrayBuffer = file.content as ArrayBuffer
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'html': return 'bg-[#FF5577]/10 text-[#FF5577] border border-[#FF5577]/20'
      case 'css': return 'bg-[#0AA3D5]/10 text-[#0AA3D5] border border-[#0AA3D5]/20'
      case 'js': return 'bg-[#EA9D05]/10 text-[#EA9D05] border border-[#EA9D05]/20'
      case 'image': return 'bg-green-100 text-green-700 border border-green-200'
      default: return 'bg-gray-100 text-gray-600 border border-gray-200'
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-6xl border-2 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-2xl shadow-lg ${
          toast.type === 'success'
            ? 'bg-gradient-to-r from-[#0AA3D5] to-[#0bb3e5] text-white'
            : 'bg-gradient-to-r from-[#FF5577] to-[#ff6688] text-white'
        } z-50 animate-slide-in`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0AA3D5] to-[#0bb3e5] text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0bb3e5]">ファイルプレビュー</h2>
              <p className="text-xs text-white/80">ZIPファイルを解凍してプレビュー</p>
            </div>
          </div>
          <label htmlFor="file-upload" className="px-6 py-2 bg-white text-[#0AA3D5] rounded-full cursor-pointer hover:shadow-lg transition-all text-sm font-medium">
            ZIPをアップロード
            <input
              id="file-upload"
              type="file"
              accept=".zip"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File List */}
        <div className="w-72 border-r border-gray-100 overflow-y-auto bg-gray-50">
          {files.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                ZIPファイルをアップロード
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ドラッグ&ドロップも可能
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 cursor-pointer rounded-xl transition-all ${
                    selectedFile?.path === file.path
                      ? 'bg-gradient-to-r from-[#0AA3D5]/10 to-[#0bb3e5]/10 border-l-4 border-[#0AA3D5] shadow-sm'
                      : 'hover:bg-white border-l-4 border-transparent'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <p className={`text-sm truncate ${selectedFile?.path === file.path ? 'font-semibold text-[#0E2D5A]' : 'font-normal text-gray-700'}`}>
                    {file.name}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-medium ${getBadgeColor(file.type)}`}>
                    {file.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-[#FF5577]/20 to-[#0AA3D5]/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#0AA3D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">ファイルを選択してプレビュー</p>
              <p className="text-sm text-gray-400 mt-1">左側のリストからファイルを選択してください</p>
            </div>
          ) : selectedFile.type === 'html' && previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="Preview"
            />
          ) : selectedFile.type === 'image' && previewUrl ? (
            <div className="flex items-center justify-center h-full p-8 bg-gray-50">
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            </div>
          ) : (
            <div className="p-6 overflow-y-auto h-full bg-gray-50">
              <div className="bg-[#0E2D5A] rounded-xl p-4 shadow-lg">
                <pre className="text-xs whitespace-pre-wrap text-gray-100 font-mono">
                  {selectedFile.content as string}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
