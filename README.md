# ラブライブ！Wiki

ラブライブ！シリーズに関する情報を集約し、SPARQL および LLM エージェントによる検索を可能にする構造化 Wiki です。

## 概要

- コンテンツは Markdown + YAML フロントマターで記述
- ページ間の関係は Wikilinks 記法 (`[[対象]](プロパティ)`) で表現
- ビルド時に JSON-LD グラフ (`vault/jsonld/graph.jsonld`) を自動生成
- [Lume](https://lume.land/) で静的サイトをビルドし、[Oxigraph](https://github.com/oxigraph/oxigraph) で SPARQL クエリに対応

## ディレクトリ構成

```
vault/
  index.md                     # トップページ
  guide.md                     # 記述規約・スキーマガイド
  jsonld/graph.jsonld          # コンパイル済み知識グラフ (JSON-LD)
  sparql/index.html            # SPARQL クエリ UI
  {シリーズ名}/
    TVSeries/                  # メディアミックスプロジェクト
    Person/                    # キャラクター・声優
    MusicGroup/                # ユニット・グループ
    MusicAlbum/                # シングル・アルバム
    MusicRecording/            # 収録曲 (表題曲以外)
    MusicEvent/                # ライブイベント
    EducationalOrganization/   # サテライト校
    Place/                     # ライブ会場
scripts/
  gen-jsonld.ts                # JSON-LD 生成スクリプト
  validate.ts                  # JSON-LD 検証スクリプト
main.ts                        # サーバー (静的配信 + SPARQL API)
_config.ts                     # Lume 設定
```

## 開発

```sh
# 静的サイトのビルド + サーバー起動
deno task start

# ウォッチモードでサーバーのみ起動 (ビルド済み前提)
deno task dev

# Lume 開発サーバー (ホットリロード)
deno task serve

# JSON-LD の再生成と検証
deno task gen-jsonld

# lint / format
deno task check
```

## ファイル形式

各 Markdown ファイルは YAML フロントマターでエンティティを定義します。

```yaml
---
"@context": "https://schema.org"
"@id": "<スラグ>"
"@type": "<schema.org の型>"
"name": "<表示名>"
---
```

ページ間の関係は本文中に Wikilinks 記法で記述します。

```
[[対象スラグ]](プロパティ名)
```

例: `[[いきづらい部]](memberOf)` - このエンティティが `memberOf` として `いきづらい部` を参照します。

## SPARQL API

サーバー起動後、`POST /api/sparql` で SPARQL SELECT クエリを実行できます。

### リクエスト

```
POST /api/sparql
Content-Type: application/json

{ "query": "<SPARQL クエリ文字列>" }
```

### レスポンス

```json
{
  "vars": ["var1", "var2"],
  "results": [
    { "var1": "値1", "var2": "値2" }
  ]
}
```

### クエリ例

**グループのメンバー一覧**

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?memberName WHERE {
  ?group schema:name "いきづらい部" .
  ?group schema:member ?member .
  ?member schema:name ?memberName .
}
```

**キャラクターのソロ楽曲**

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?albumName WHERE {
  ?person schema:name "高橋ポルカ" .
  ?person schema:album ?album .
  ?album schema:name ?albumName .
}
```

**ライブのセットリスト**

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?songName WHERE {
  ?event schema:name "What is my L?" .
  ?event schema:workPerformed ?song .
  ?song schema:name ?songName .
}
```

### エラーレスポンス

| ステータス | 内容 |
|---|---|
| 400 | クエリ構文エラー、`query` フィールド未指定、JSON パース失敗 |

## 貢献

[リポジトリ](https://github.com/ll-open-data/ll-wiki) に PR を送ってください。記述規約の詳細は [vault/guide.md](vault/guide.md) を参照してください。
