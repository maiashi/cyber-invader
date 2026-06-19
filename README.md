# CYBER INVADER

レトロ風インベーダー×ギャラクシアンのサイバー弾幕シューティング。

![CYBER INVADER](screenshot.png)

## 概要

5面＋ボス構成の弾幕シューティングゲーム。Geo風サイバーグリッドとネオン発光エフェクトでサイバーパンクな世界観を表現。

## ゲームシステム

### プレイヤー操作

| キー | 操作 |
|------|------|
| ← → ↑ ↓ | 移動 |
| Z | ショット |
| X | フォーカスモード（低速精密移動） |
| C | ボム |
| V | ボム切替（クリア/吸収） |

### パワーアップ

Lv1〜Lv5の段階式強化。見た目で強化レベルが分かる演出付き。

- **P（パワー）** — 弾数・拡散角・弾力の強化
- **B（ボム）** — ボムの残数を補充

### ボム

- **CLEAR** — 画面内の敵弾を一掃
- **ABSORB** — ダメージを一定時間吸収（Vキーで切替）

### 敵タイプ

| タイプ | 説明 |
|--------|------|
| GRUNT | 雑魚敵。基本的な射撃パターン |
| MEDIUM | 中型敵。パターンが変化する |
| TURRET | 砲台。狙い撃ちを仕掛ける |
| SUPPORT | 支援機。バフ・デバフを付与 |
| BOSS | ボス。多段フェーズで弾幕を展開 |

### 弾幕パターン

12種類の弾幕パターンを搭載：

`aimed`・`spread`・`circle`・`spiral`・`homing`・`laser`・`split`・`doubleSpiral`・`wave`・`rotating`・`mixed`・`gravity`

## 開発環境

### 前提条件

- Node.js 18+

### 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:8082` にアクセス。

## プロジェクト構造

```
├── index.html          # メインHTML
├── css/
│   └── style.css       # スタイルシート
├── js/
│   ├── main.js         # ゲームループ・メインエントリー
│   ├── const.js        # 定数定義
│   ├── utils.js        # ユーティリティ
│   ├── player.js       # プレイヤー
│   ├── bullet.js       # 弾システム・弾幕パターン
│   ├── enemy.js        # 敵システム
│   ├── particle.js     # パーティクルエフェクト
│   ├── powerup.js      # パワーアップ
│   ├── bomb.js         # ボムシステム
│   ├── stage.js        # ステージ定義
│   └── audio.js        # Web Audio APIによるSFX
├── server.js           # 開発用HTTPサーバー
├── package.json
└── README.md
```

## 技術スタック

- Canvas 2D レンダリング
- ES Modules（import/export）
- 60fps ゲームループ（requestAnimationFrame）
- Web Audio API（SFX）

## ライセンス

MIT
