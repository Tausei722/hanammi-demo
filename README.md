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
- Node.js 18以上（ローカル開発の場合）
- Docker & Docker Compose（Docker環境の場合）

### 方法1: ローカル環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

#### OpenAI APIの設定

AIチャット機能を有効にするには、OpenAI APIキーが必要です：

1. [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキーを取得
2. プロジェクトルートに `.env.local` ファイルを作成
3. 以下の内容を記述：

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

4. 開発サーバーを再起動

**注意**: `.env.local` は `.gitignore` に含まれており、GitHubにコミットされません。

### 方法2: Docker環境

#### プロダクション環境

```bash
# Dockerイメージをビルドして起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

#### 開発環境

```bash
# 開発用コンテナを起動（ホットリロード有効）
docker-compose --profile dev up dev

# 停止
docker-compose --profile dev down
```

開発環境は [http://localhost:3001](http://localhost:3001) で起動します。

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

**✅ OpenAI API統合済み**

このアプリケーションは OpenAI API (GPT-3.5 Turbo) と統合されています。

### 使用しているモデル
- **GPT-3.5 Turbo**: コストパフォーマンスに優れた高速モデル
- 会話履歴をサポート（最新10件）
- 日本語対応

### モデルの変更

より高性能なモデルを使用する場合は、`app/api/chat/route.ts` の以下の部分を変更：

```typescript
// GPT-4を使用する場合
model: 'gpt-4-turbo-preview',

// GPT-4oを使用する場合
model: 'gpt-4o',
```

### APIコスト管理

- 会話履歴は最新10件のみ送信（コスト削減）
- `max_tokens: 500` で応答長を制限
- 実運用では、ユーザーごとの使用量制限を推奨

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
