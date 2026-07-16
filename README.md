# ラブライブ！Wiki

ラブライブ！シリーズに関する情報を集約し、SPARQL および LLM エージェントによる検索を可能にする構造化 Wiki です。

議論・修正リクエストはこちらから: https://discord.gg/bUvhuJtPYb

## 概要

- コンテンツは Markdown + YAML フロントマターで記述
- ページ間の関係は Wikilinks 記法 (`[[対象]](プロパティ)`) で表現
- ビルド時に JSON-LD グラフ (`vault/jsonld/graph.jsonld`) を自動生成
- [Lume](https://lume.land/) で静的サイトをビルドし、[Oxigraph](https://github.com/oxigraph/oxigraph) で SPARQL クエリに対応

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
