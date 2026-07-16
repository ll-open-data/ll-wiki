# AGENTS.md - エージェント向け探索ガイド

このドキュメントはLLMエージェントがll-wikiを効率的に探索するための手順を記述します。

## このWikiに含まれるもの

ラブライブ！シリーズに関する構造化データ。

## データへの最速アクセス

**構造化クエリが目的の場合**: まず `vault/jsonld/graph.jsonld` を読む。全エンティティ・型・リレーションがJSON-LDとして収録されています。

**自然言語の詳細情報が目的の場合**: 対象エンティティのMarkdownファイルを読む。誕生日・身長・性格説明など、JSON-LDに含まれない情報が本文に記述されています。

## 特定エンティティの見つけ方

1. 型を確認する（Person, MusicAlbum, MusicGroup など）
2. `vault/<型>/<スラグ>.md` を読む
3. スラグ = 表示名をASCII小文字化・スペースを `-` に・記号を `-` に変換したもの

例:
- キャラクター「高橋ポルカ」-> `vault/Person/高橋ポルカ.md`
- シングル「Daitan Party Time」-> `vault/MusicAlbum/daitan-party-time.md`
- グループ「いきづらい部!」-> `vault/MusicGroup/いきづらい部.md`

## エンティティ型とディレクトリ

| ディレクトリ | 型 | 内容 |
|---|---|---|
| `Person/` | キャラクター or 声優 | 名前・所属ユニット・ディスコグラフィ・学校 |
| `MusicGroup/` | アイドルユニット/グループ | メンバー・ディスコグラフィ・サブ/親ユニット |
| `MusicAlbum/` | シングルorアルバム | アーティスト・収録曲・披露イベント |
| `MusicRecording/` | 収録曲（表題曲以外） | アーティスト・収録アルバム・披露イベント |
| `MusicEvent/` | ライブイベント | 会場・日程・セットリスト・キャスト |
| `TVSeries/` | メディアミックスプロジェクト | キャラクター・キャスト・ライブイベント・親ユニット |
| `EducationalOrganization/` | サテライト校 | 名称・所在地 |
| `Place/` | 会場・場所 | 開催イベント・関連人物 |
| `Organization/` | 企業・NGO・プロジェクト | メンバー・所在地 |
| `LocalBusiness/` | 店舗・事業所 | 所在地・関連人物 |
| `Event/` | 非音楽イベント | 参加者・開催場所 |
| `CreativeWork/` | 記事・リスト等 | 作成者・言及内容 |
| `Product/` | 物・食品・グッズ | 関連人物・物 |
| `SoftwareApplication/` | ソフトウェア | 開発組織 |

## リレーションの辿り方

Markdownの本文中 `[[対象]](プロパティ)` 形式でリレーションが記述されています。

- グループのメンバーを知りたい -> MusicGroupファイルの `[[X]](member)` を収集
- キャラクターの担当声優を知りたい -> Personファイルの `[[X]](relatedTo)` を参照
- ライブのセットリストを知りたい -> MusicEventファイルの `[[X]](workPerformed)` を収集

同じリレーションは `vault/jsonld/graph.jsonld` でもJSON-LDプロパティとして参照できます。
