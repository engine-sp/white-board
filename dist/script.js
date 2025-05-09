// 獲取畫布元素和上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn'); // 獲取新的儲存按鈕

// ... (你原有的程式碼) ...

// 儲存到剪貼簿功能
async function saveToClipboard() {
  // 找出畫布上繪製的邊界
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a !== 0) { // 如果像素不是完全透明
      const x = (i / 4) % canvas.width;
      const y = Math.floor(i / 4 / canvas.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  // 計算包含留白的繪製區域
  const padding = 10; // 可以調整留白大小
  const startX = Math.max(0, minX - padding);
  const startY = Math.max(0, minY - padding);
  const width = Math.min(canvas.width - startX, maxX - minX + 2 * padding);
  const height = Math.min(canvas.height - startY, maxY - minY + 2 * padding);

  // 創建一個新的臨時 canvas 來繪製裁剪後的圖像
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

  // 將臨時 canvas 的內容轉換為 Blob
  tempCanvas.toBlob(async (blob) => {
    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        alert('已儲存至剪貼簿！');
      } else {
        alert('您的瀏覽器不支持複製圖片到剪貼簿。');
      }
    } catch (err) {
      console.error('複製到剪貼簿失敗:', err);
      alert('複製到剪貼簿失敗，請檢查瀏覽器權限。');
    }
  }, 'image/png');
}

// 監聽儲存按鈕的點擊事件
saveBtn.addEventListener('click', saveToClipboard);

// ... (你原有的程式碼) ...
