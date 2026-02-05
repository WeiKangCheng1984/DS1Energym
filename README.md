# 電幻1號所 Energym

單頁能源主題互動遊戲，共 **5 款遊戲**：水力彈跳、風力舞踏、光伏運動、波浪戰繩、地熱飛輪。每款含 60 秒倒數、關卡目標、雙人競賽與勝利畫面。

## 技術棧

- **Next.js**（App Router）+ **React**
- **TypeScript**
- **Tailwind CSS**
- **Canvas API**（特效繪製）

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

### 建置與預覽

```bash
npm run build
npm run start
```

## 5 款遊戲

| 編號 | 遊戲名稱 | 說明 |
|------|----------|------|
| 1 | 水力彈跳 (Hydro Jump) | 點擊圓點使水柱上升，三階段過關 |
| 2 | 風力舞踏 (Wind Dancing) | 左右交替點擊，Logo 變色完成 |
| 3 | 光伏運動 (Solar Shooting) | 投進 12 顆光子球至太陽能板 |
| 4 | 波浪戰繩 (Wave Battling) | 壓住搖擺產生波痕，光條滿即過關 |
| 5 | 地熱飛輪 (Geothermal Turning) | 飛輪踩踏，金字塔逐層亮燈至蒸汽噴發 |

首頁為遊戲選單，點選卡片進入 `/mode/1`～`/mode/5`，每款支援單人與雙人競賽。

## 部署到 Vercel

1. **將程式碼推送到 GitHub**
   - 在專案目錄執行：
     ```bash
     git init
     git add .
     git commit -m "Initial commit: 電幻1號所 Energym"
     git branch -M main
     git remote add origin https://github.com/你的帳號/你的儲存庫名稱.git
     git push -u origin main
     ```

2. **在 Vercel 連結儲存庫**
   - 前往 [Vercel](https://vercel.com) 並登入。
   - 點選 **Add New Project**，選擇剛推送的 GitHub 儲存庫。
   - Vercel 會自動偵測為 Next.js 專案，無需額外設定。
   - 點選 **Deploy** 即可部署。

3. **後續更新**
   - 每次 `git push` 到 `main` 分支，Vercel 會自動重新部署。

## 專案結構（摘要）

```
app/
  page.tsx              # 首頁選單
  mode/[id]/page.tsx    # 動態路由（1–5）
components/
  ModeCard.tsx          # 遊戲卡片
  games/                # 五款遊戲元件與勝利 SVG
lib/
  constants.ts          # 遊戲常數
  useCountdown.ts       # 60 秒倒數
  useSound.ts           # 簡易音效
  utils.ts              # 共用工具
```

## 授權

專案僅供學習與個人使用。
