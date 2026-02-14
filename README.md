# Hanamii AIアシスタント デモ

hanamii.jp と同じ技術スタック（Next.js）を使用した、AIアシスタントチャットとファイルプレビュー機能のデモアプリケーションです。

## 機能

### 1. AIチャットウィンドウ
- AIとの対話型チャットインターフェース
- リアルタイムメッセージ表示
- モックAI応答（実際のAI APIと統合可能）

### 2. ファイルプレビュー
- ZIPファイルのアップロードと解凍
- ファイル一覧の表示
- HTMLファイルのプレビュー（iframe）
- 画像ファイルのプレビュー
- CSS、JS、その他のテキストファイルの表示

## 技術スタック

- **Next.js 16** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **JSZip** - ZIPファイルの解凍

## セットアップ

### 前提条件
- Node.js 18以上

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start
```

## 使い方

### AIチャット
1. 「AIチャット」タブを選択
2. メッセージ入力欄にテキストを入力
3. 「送信」ボタンをクリックまたはEnterキーを押す
4. AI応答が表示されます（現在はモック応答）

### ファイルプレビュー
1. 「ファイルプレビュー」タブを選択
2. 「ZIPファイルをアップロード」ボタンをクリック
3. ZIPファイルを選択
4. 解凍されたファイル一覧が左側に表示されます
5. ファイルをクリックしてプレビュー表示

## AI APIの統合

現在のAIチャット機能はモック応答を返しています。実際のAI APIを統合するには、`components/AIChatWindow.tsx` の `handleSend` 関数内の `setTimeout` 部分を以下のように置き換えてください：

```typescript
// 例: OpenAI APIとの統合
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: currentInput }),
})
const data = await response.json()
const assistantMessage: Message = {
  id: (Date.now() + 1).toString(),
  role: 'assistant',
  content: data.response,
  timestamp: new Date(),
}
setMessages((prev) => [...prev, assistantMessage])
```

## プロジェクト構造

```
hanamii-demo/
├── app/
│   ├── layout.tsx          # レイアウトコンポーネント
│   ├── page.tsx            # メインページ
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── AIChatWindow.tsx    # AIチャットコンポーネント
│   └── FilePreview.tsx     # ファイルプレビューコンポーネント
├── public/                 # 静的ファイル
└── package.json            # 依存関係
```

## カスタマイズ

### スタイルの変更
Tailwind CSSを使用しているため、各コンポーネントのクラス名を変更することで簡単にスタイルをカスタマイズできます。

### 機能の拡張
- AI APIの統合
- チャット履歴の保存
- ファイルアップロードの制限設定
- 追加のファイル形式のサポート

## Vercelへのデプロイ

このNext.jsアプリケーションは、[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用して簡単にデプロイできます。

詳細は[Next.jsデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご覧ください。
