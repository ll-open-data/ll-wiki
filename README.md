# ラブライブ！Wiki

ラブライブ！シリーズに関する情報を集約し、SPARQL および LLM エージェントによる検索を可能にする構造化 Wiki です。

議論・修正リクエストはこちらから: https://discord.gg/bUvhuJtPYb

## 概要

- コンテンツは Markdown + YAML フロントマターで記述
- ページ間の関係は Wikilinks 記法 (`[[対象]](プロパティ)`) で表現
- ビルド時に JSON-LD グラフ (`vault/jsonld/graph.jsonld`) を自動生成
- [Lume](https://lume.land/) で静的サイトをビルドし、[Oxigraph](https://github.com/oxigraph/oxigraph) で SPARQL クエリに対応

## 編集

### 編集フロー

1. 開発サーバーでチェック
```sh
deno task start
```

2. JSON-LDグラフの生成
```sh
deno task gen-jsonld
```

3. TS/JSON等のフォーマット・リント
```sh
deno task check
```

4. 文書校正のチェック
```sh
deno task lint:dry
```

### 文章校正について

`deno task lint` は [textlint](https://textlint.github.io/) と `preset-ja-technical-writing` を使って日本語の文章品質をチェックします。主なチェック項目は以下のとおりです。

- 文末が `。` で終わっているか
- 同じ助詞の連続使用がないか
- 文が長すぎないか (100文字以内)
- 数量表現が算用数字になっているか (`一つ` → `1つ`)
- 冗長な表現がないか

#### キャラクター発言などの除外

公式テキストやキャラクターの発言など、ルールを適用すべきでない箇所は以下のコメントで囲んで除外できます。

```markdown
<!-- textlint-disable -->

此花輝夜:「...」

<!-- textlint-enable -->
```

#### lintの対象外ファイル

`.textlintignore` に記載されたファイルはlintをスキップします。現在 `vault/llms.txt` は `.txt` 拡張子のためMarkdownとして解析されず誤検知が多いため除外しています。

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

W3C SPARQL 1.1 Protocol 準拠。サーバー起動後、`GET /sparql` で SPARQL SELECT クエリを実行できます。

### リクエスト

```
GET /sparql?query=<URL エンコードされた SPARQL クエリ>
```

### レスポンス

SPARQL 1.1 Query Results JSON Format:

```json
{
  "head": { "vars": ["var1", "var2"] },
  "results": {
    "bindings": [
      {
        "var1": { "type": "literal", "value": "値1" },
        "var2": { "type": "uri", "value": "https://example.org/値2" }
      }
    ]
  }
}
```

### エラーレスポンス

| ステータス | 内容 |
|---|---|
| 400 | クエリ構文エラー、`query` パラメータ未指定 |

## 貢献

[リポジトリ](https://github.com/ll-open-data/ll-wiki) に PR を送ってください。記述規約の詳細は [vault/guide.md](vault/guide.md) を参照してください。
