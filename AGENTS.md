# CYBER INVADER - Agent Instructions

## プロジェクト概要

レトロ風インベーダー×ギャラクシアンのサイバー弾幕シューティング。5面＋ボス構成。

- Geo風サイバーグリッド、ネオン発光エフェクト
- 移動＋ショット＋フォーカスモード
- パワーアップLv1〜Lv5段階強化
- ボム（クリア/吸収切替）
- 敵バリエーション（雑魚/中型/砲台/支援/ボス）
- 弾幕パターン（aimed/spread/circle/spiral/homing/laser/split/doubleSpiral/wave/rotating/mixed/gravity）

## サーバー起動方法

```bash
cd /Volumes/ext/home/maiashi/src/ex10
rtk proxy npm run dev
```

ブラウザで `http://localhost:8082` にアクセス。

## 開発ルール

### agent-worklog.md の更新（必須）

**各作業の完了後、必ず agent-worklog.md を更新する。**

以下の3セクションを最新に保つ：
1. **作業指示の要約** - 現在のタスクの概要
2. **完了済み** - 完了した作業のチェックリスト
3. **実施した作業内容** - 日付付きの作業ログ
4. **残作業** - 未完了のタスク

更新タイミング：
- 作業を開始する前：残作業にタスクを追加
- 作業を完了した後：完了済みにチェック、実施した作業内容にログを追加
- 作業がブロックされた場合：残作業に注記

### コーディング規約

- ES Modules（import/export）
- Canvas 2D レンダリング
- 60fps ゲームループ（requestAnimationFrame）
- モジュール分割：const.js, utils.js, player.js, bullet.js, enemy.js, particle.js, powerup.js, bomb.js, stage.js, audio.js, main.js
- 変数名はキャメルケース
- 定数は大文字スネークケース

### 弾幕パターン

弾幕パターンは `bullet.js` の `BulletPattern` クラスで定義：
- aimed, spread, circle, spiral, homing, laser, split, doubleSpiral, wave, rotating, mixed, gravity

### 敵タイプ

- GRUNT（雑魚）- 基本的な射撃パターン
- MEDIUM（中型）- パターン変化
- TURRET（砲台）- 狙い撃ち
- SUPPORT（支援）- バフ・デバフ
- BOSS（ボス）- 多段フェーズ

### パワーアップ

- Lv1〜Lv5の段階式強化
- 見た目で強化が分かる演出（弾数・拡散角・色変化）

### ボム

- CLEAR（画面クリア）/ ABSORB（ダメージ吸収）切替
- 残数制

## テスト方法

1. サーバー起動：`rtk proxy npm run dev`
2. ブラウザで `http://localhost:8082` にアクセス
3. 各ステージのプレイテスト
4. コンソールエラーの確認

## 既知の問題

- 難易度バランスの調整が必要
- モバイルタッチ操作の改善余地あり
- 弾幕パターンの追加・改善余地あり
