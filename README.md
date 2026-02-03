# 紓壓小遊戲

單頁紓壓小遊戲，共 **16 種模式**。點擊或按壓畫面即可觸發不同視覺特效。

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

## 16 種模式

| 編號 | 模式名稱 |
|------|----------|
| 1 | 漣漪／水波 |
| 2 | 粒子爆炸／煙火 |
| 3 | 泡泡破裂 |
| 4 | 星空／流星 |
| 5 | 墨水暈染 |
| 6 | 碎玻璃／裂紋 |
| 7 | 花瓣／葉子飄落 |
| 8 | 彩虹光暈 |
| 9 | 幾何圖形擴散 |
| 10 | 螢火蟲／光點 |
| 11 | 雪花 |
| 12 | 按壓變形 |
| 13 | 音波／聲波圈 |
| 14 | 塗鴉／畫筆軌跡 |
| 15 | 氣泡上升 |
| 16 | 自訂 |

首頁為模式選單，點選卡片進入 `/mode/1`～`/mode/16`，在該頁面點擊或觸控即可觸發對應特效。

## 部署到 Vercel

1. **將程式碼推送到 GitHub**
   - 在專案目錄執行：
     ```bash
     git init
     git add .
     git commit -m "Initial commit: 紓壓小遊戲"
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
  mode/[id]/page.tsx    # 動態路由（1–16）
components/
  ModeCard.tsx          # 模式卡片
  effects/              # 各模式特效元件
lib/
  constants.ts          # 模式常數
  utils.ts              # 共用工具
```

## 授權

專案僅供學習與個人使用。
