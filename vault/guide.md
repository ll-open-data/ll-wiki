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
    - AGENTS.mdとllms.txtにデータ構造、サーチ方法を記載

## 規約

- ファイルは `vault/<シリーズ名>/<@type>/` に配置する。
- シリーズ名のフォルダはシリーズごとに作成する (例: `ikizulive`)。
- `@type` ごとのフォルダ名は schema.org の型名をそのまま使用する (例: `MusicAlbum`, `Person`)。

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
| `name` | 表示名(楽曲・タイトル等正式名称を記載) |

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
| `album` | `MusicAlbum` | リリースしたソロシングル/アルバム (WARNING レベル) | - |
| `affiliation` | `Organization` | 所属している学校・組織 | 所属している事務所 |
| `relatedTo` | `Person` | 担当声優 | 担当キャラクター |
| `homeLocation` | `Place` | 出身地・居住地 | - |
| `parent` | `Person` | 親 (子→親方向) | - |
| `children` | `Person` | 子 (親→子方向) | - |
| `sibling` | `Person` | 兄弟姉妹 | - |
| `spouse` | `Person` | 配偶者 | - |
| `knows` | `Person` | 祖母・伯母など専用プロパティのない親族、または知人 | - |
| `knowsAbout` | `Thing` / `Organization` | 好きなもの・関心・得意分野 | - |

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

### Place (場所)

地理的・物理的な場所全般に使用する。ライブ会場・川・街・観光スポット等を含む。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `subjectOf` | `MusicEvent` | この会場で開催されたライブイベント |
| `mentions` | `Person` / `Thing` | 関連する人物・物 (WARNING レベル) |

### Organization (組織)

企業・NGO・プロジェクト等に使用する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `location` | `Place` | 所在地 |
| `member` | `Person` / `Organization` | メンバー・構成員 |
| `funder` | `Person` / `Organization` | 資金・寄付で支援する人・組織 |
| `subOrganization` | `Organization` | 傘下組織 |
| `parentOrganization` | `Organization` | 親組織 |
| `mentions` | `Person` / `Thing` | 関連する人物・物 (WARNING レベル) |

### LocalBusiness (店舗・事業所)

`LocalBusiness` は `Place` と `Organization` 両方のサブタイプ。両者のプロパティが使用可能。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `location` | `Place` | 所在地 |
| `member` | `Person` | 従業員・オーナー等 |
| `mentions` | `Person` / `Thing` | 関連する人物・物 (WARNING レベル) |

### Thing (物・食品・グッズ)

`Product` 型はバリデーターが商用プロパティ (`image`, `offers` 等) を必須とするため、食品・グッズ等には `Thing` 型を使用する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `mentions` | `Person` / `Thing` | 関連する人物・物 (WARNING レベル) |

### CreativeWork (記事・リスト等)

キャラクターが作成したおすすめリストや記事等に使用する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `author` | `Person` | 作成者 |
| `mentions` | `Person` / `Place` / `Thing` | 言及している人物・場所・物 |

### SoftwareApplication (ソフトウェア)

ソフトウェア・OS・アプリケーション等に使用する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `producer` | `Organization` | 開発・制作組織 |

### Event (非音楽イベント)

音楽ライブ以外のイベント・祭事等に使用する。`MusicEvent` は別途 `MusicEvent` フォルダで管理する。

| プロパティ | 終点エンティティ | 意味 |
|---|---|---|
| `attendee` | `Person` / `Organization` | 参加者 |
| `location` | `Place` | 開催場所 |
