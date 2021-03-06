# Qiita Team Viewer

Qiita:Team を閲覧するためのクライアントです。
以下の機能を備えています。

- 所属する Qiita:Team の記事をリストで表示
- Qiita:Team の記事の閲覧
- Qiita:Team の記事およびコメントへの絵文字リアクションの追加および削除

ほとんどの機能は `read_qiita_team` のスコープに収まりますが、絵文字リアクションの追加および削除のために `write_qiita_team` の権限を要求します。

参照： [Qiita API v2 のスコープ](https://qiita.com/api/v2/docs#%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%97)

# ダウンロード

https://github.com/risou/qiita-team-viewer/releases/tag/v0.2.0

現時点では OS X 版のみバイナリを用意しています。

# 使い方

初回起動すると Qiita へのログインを要求されます。
Qiita にログインした後、 Qiita Team Viewer との連携を求められます。
（ここで `read_qiita_team` および `write_qiita_team` の権限を要求される旨が確認できます）
連携すると、自動的に所属する全ての Qiita:Team から新着記事を10件ずつ取得し、投稿日時の降順で表示します。

# キーボードショートカット

キー | 動作
:--: | :---
J | 次の記事を表示する
K | 前の記事を表示する
L | 表示している記事をブラウザで開く
R | 記事リストを更新する
G | リスト内の最も新しい記事を表示する
Shift+G | リスト内の最も古い記事を表示する 
Cmd+F | 検索フィールドにフォーカスする

# リンク

- 記事のタグ
    - 記事詳細のタイトル下のタグをクリックすると、そのタグで検索可能

# 追加予定の機能

以下の機能の追加を考えています（追加される保証はありません）。

- 既読管理
- 記事へのコメント追加

