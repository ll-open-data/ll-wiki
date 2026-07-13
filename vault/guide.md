---
name: "Wikiガイド"
---

# Wikiガイド

## Wikiの目的
- ラブライブ！に関連するデータを集約し、柔軟な方法でクエリできるようにする。

## クエリ方法

- SPARQL
    - RDFでページ間の関係を記述し、JSON-LDに変換

- Agentic Search
    - ただRDFを記述するだけでなく、そこに自然言語で情報を付加することで、LLMによるAgentic Searchを可能にする
    - AGENTS.mdに、llms.txtにデータ構造、サーチ方法を記載

## 規約

- 可能な限りフォルダ分けをしない。vault/直下にファイルを作成し、整理はリンクによって行う。

### ファイル命名規則

- ASCII英数字は小文字にする
- スペースは `-` に置き換える
- 記号(`!`, `?`, `×`, `=`, `'`, `―` など)は `-` に変換し、連続する `-` は1つにまとめる。末尾の `-` は除去
- 日本語(ひらがな・カタカナ・漢字)はそのまま維持する

例:
- `CHAKI!` -> `chaki`
- `Daitan Party Time` -> `daitan-party-time`
- `Mi×Nori=Tea` -> `mi-nori-tea`
- `いきづらい部!` -> `いきづらい部`
- `イキヅライブ! LOVELIVE! BLUEBIRD` -> `イキヅライブ-lovelive-bluebird`

## 記法

- ページについての属性は、フロントマターに記述する。
- フロントマターには以下の4項目のみを記載する。

| キー | 内容 |
|---|---|
| `@context` | 常に `https://schema.org` 固定 |
| `@id` | ファイルのスラグ (ファイル名と一致させる) |
| `@type` | エンティティの種別 |
| `name` | 表示名 |

- ページ間のリンク・関係を表すときは、Wikilinks記法を用いて
[[リンク対象]](関係)
のように記述する。

高橋ポルカの例:

[[いきづらい部]](memberOf)

これらの記法によって、コミット時にJSON-LDが自動生成される。

## エンティティ別プロパティ規約

よく使うカテゴリ・関係のガイド

### MusicAlbum (シングル/アルバム)

表題曲とシングル/アルバムページは同一とする。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `byArtist` | `Person` / `MusicGroup` | 歌唱しているキャラクターまたはユニット |
| `track` | `MusicAlbum` | 表題曲以外の収録楽曲 |
| `subjectOf` | `MusicEvent` | このシングル/アルバムが披露されたイベント |

### MusicRecording (楽曲)

表題曲以外の収録曲に使用する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `byArtist` | `Person` / `MusicGroup` | 歌唱しているキャラクターまたはユニット |
| `inAlbum` | `MusicAlbum` | 収録されているシングル/アルバム |
| `subjectOf` | `MusicEvent` | この楽曲が披露されたイベント |

### MusicGroup (グループ/ユニット)

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `album` | `MusicAlbum` | リリースしたシングル/アルバム |
| `member` | `Person` | メンバー |
| `parentOrganization` | `MusicGroup` | 所属する親ユニット (サブユニットの場合のみ) |
| `subOrganization` | `MusicGroup` | 傘下のサブユニット (親ユニットの場合のみ) |

### Person (キャラクター/声優)

`Person` はキャラクターと声優の両方に使用する。

| プロパティ | 終点エンティティ | キャラクター | 声優 |
|---|---|---|---|
| `memberOf` | `MusicGroup` | 所属するグループ/ユニット | 所属するグループ/ユニット |
| `album` | `MusicAlbum` | リリースしたソロシングル/アルバム | - |
| `affiliation` | `Organization` | 所属している学校 | 所属している事務所 |
| `relatedTo` | `Person` | 担当声優 | 担当キャラクター |

### MusicEvent (ライブイベント)

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `actor` | `Person` | 演者 (声優) |
| `location` | `Place` | 開催会場 |
| `workPerformed` | `MusicAlbum` / `MusicRecording` | セットリスト |

### TVSeries (メディアミックスプロジェクト)

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `actor` | `Person` | 声優 |
| `character` | `Person` | 登場キャラクター |
| `recordedAt` | `MusicEvent` | ライブイベント |
| `musicBy` | `MusicGroup` | プロジェクトの親ユニット |

### Place (ライブイベント会場)

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `subjectOf` | `MusicEvent` | この会場で開催されたライブイベント |
