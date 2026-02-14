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
      case 'html': return 'bg-orange-100 text-orange-800'
      case 'css': return 'bg-blue-100 text-blue-800'
      case 'js': return 'bg-yellow-100 text-yellow-800'
      case 'image': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-6xl border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } z-50`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-green-500 text-white px-4 py-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">ファイルプレビュー</h2>
          <label htmlFor="file-upload" className="px-4 py-2 bg-white bg-opacity-20 rounded-md cursor-pointer hover:bg-opacity-30 transition-all text-sm">
            ZIPファイルをアップロード
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
        <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
          {files.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 text-center">
                ZIPファイルをアップロードしてください
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer border-l-3 ${
                    selectedFile?.path === file.path
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'border-l-4 border-l-transparent hover:bg-gray-100'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <p className={`text-sm ${selectedFile?.path === file.path ? 'font-bold' : 'font-normal'}`}>
                    {file.name}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getBadgeColor(file.type)}`}>
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
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">ファイルを選択してプレビュー</p>
            </div>
          ) : selectedFile.type === 'html' && previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="Preview"
            />
          ) : selectedFile.type === 'image' && previewUrl ? (
            <div className="flex items-center justify-center h-full p-4">
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-4 overflow-y-auto h-full">
              <pre className="text-xs whitespace-pre-wrap">
                {selectedFile.content as string}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
