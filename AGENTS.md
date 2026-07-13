# AGENTS.md - エージェント向け探索ガイド

このドキュメントはLLMエージェントがll-wikiを効率的に探索するための手順を記述します。

## このWikiに含まれるもの

ラブライブ！シリーズに関する構造化データ。現在収録しているシリーズ:

- **イキヅライブ! LOVELIVE! BLUEBIRD** (`ikizulive`) - 2025年5月12日始動

## データへの最速アクセス

**構造化クエリが目的の場合**: まず `vault/jsonld/graph.jsonld` を読む。全エンティティ・型・リレーションがJSON-LDとして収録されています。

**自然言語の詳細情報が目的の場合**: 対象エンティティのMarkdownファイルを読む。誕生日・身長・性格説明など、JSON-LDに含まれない情報が本文に記述されています。

## 特定エンティティの見つけ方

1. 型を確認する（Person, MusicAlbum, MusicGroup など）
2. `vault/ikizulive/<型>/<スラグ>.md` を読む
3. スラグ = 表示名をASCII小文字化・スペースを `-` に・記号を `-` に変換したもの

例:
- キャラクター「高橋ポルカ」-> `vault/ikizulive/Person/高橋ポルカ.md`
- シングル「Daitan Party Time」-> `vault/ikizulive/MusicAlbum/daitan-party-time.md`
- グループ「いきづらい部!」-> `vault/ikizulive/MusicGroup/いきづらい部.md`

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
| `Place/` | 会場 | 開催イベント |

## リレーションの辿り方

Markdownの本文中 `[[対象]](プロパティ)` 形式でリレーションが記述されています。

- グループのメンバーを知りたい -> MusicGroupファイルの `[[X]](member)` を収集
- キャラクターの担当声優を知りたい -> Personファイルの `[[X]](relatedTo)` を参照
- ライブのセットリストを知りたい -> MusicEventファイルの `[[X]](workPerformed)` を収集

同じリレーションは `vault/jsonld/graph.jsonld` でもJSON-LDプロパティとして参照できます。

## よくあるクエリパターン

**「[グループ]のメンバーは誰か?」**
-> `vault/ikizulive/MusicGroup/<スラグ>.md` を読み、`member` wikiliksを収集する。

**「[キャラクター]が歌った曲は?」**
-> `vault/ikizulive/Person/<スラグ>.md` を読み、`album` wikilinksを収集する（ソロ曲）。
-> 所属MusicGroupファイルも参照してグループ曲を確認する。

**「[ライブ]のセットリストは?」**
-> `vault/ikizulive/MusicEvent/<スラグ>.md` を読み、`workPerformed` wikilinksを収集する。

**「[キャラクター]の担当声優は?」**
-> Personファイルの `[[X]](relatedTo)` を参照する。

**「[楽曲]が披露されたイベントは?」**
-> MusicAlbumまたはMusicRecordingファイルの `[[X]](subjectOf)` を参照する。

## 現在収録されているファイル一覧 (ikizulive)

### TVSeries
- `イキヅライブ-lovelive-bluebird` - メインプロジェクト

### Person (キャラクター)
高橋ポルカ, 麻布麻衣, 五桐玲, 駒形花火, 金澤奇跡, 調布のりこ, 春宮ゆくり, 此花輝夜, 山田真緑, 佐々木翔音

### Person (声優)
綾咲穂音, 遠藤璃菜, 宮野芹, 藤野こころ, 坂野愛羽, 瀬古梨愛, 奥村優季, 天沢朱音, 小戸森穂花, 涼ノ瀬葵音

### MusicGroup
いきづらい部, chaki, mi-nori-tea, plumina, sh1on, こーるみー, 既読待ちlovers, 恋文乙女純情派

### MusicEvent
- `what-is-my-l` - 1st LIVE「What is my L?」2026年2月14・15日 @ 幕張イベントホール
- `reply-to-l` - 2nd LIVE 2026年9月19・20日 @ 京王アリーナTOKYO

### EducationalOrganization
浅草サテライト (東京), 福井サテライト (北陸), 梅田サテライト (大阪), 仙台サテライト (東北)

### Place
幕張イベントホール, 京王アリーナtokyo
