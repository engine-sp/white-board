// 獲取畫布元素和上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn'); // 獲取新的儲存按鈕

// ... (你原有的程式碼) ...
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
// 設置畫布大小為視窗大小
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 設置畫筆顏色，選擇系統顏色與對比色
const systemColor = getComputedStyle(document.body).getPropertyValue('background-color');
const contrastColor = getContrastColor(systemColor); // 可以用一些函式計算對比色
// 設置畫筆
ctx.strokeStyle = contrastColor;  // 設定畫筆顏色
ctx.lineWidth = 5;  // 設定畫筆寬度
ctx.lineCap = 'round';  // 設定畫筆圓角


// 畫布繪圖控制變數
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let pressure = 1; // 初始筆壓（範圍 0 到 1）
let targetLineWidth = 5; // 目標筆觸寬度
let currentLineWidth = 5; // 當前筆觸寬度

// 緩動函數，使用線性插值（lerp）
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// 開始繪圖
function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = getCoordinates(e);
  draw(e);
}

// 繪製線條
function draw(e) {
  if (!isDrawing) return;
  // 根據壓力計算目標筆觸寬度
  targetLineWidth = pressure * 20;
  // 使用線性插值平滑過渡
  currentLineWidth = lerp(currentLineWidth, targetLineWidth, 0.2); // t=0.2 表示調整速度，可調整此值
  // 設定筆觸寬度
  ctx.lineWidth = currentLineWidth;
  ctx.lineCap = 'round';  // 設定畫筆圓角
  // 繪圖邏輯
  const [x, y] = getCoordinates(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

// 停止繪圖
function stopDrawing() {
  isDrawing = false;
}

// 獲取觸控或滑鼠位置
function getCoordinates(e) {
  if (e.touches) {
    return [e.touches[0].clientX, e.touches[0].clientY];
  } else {
    return [e.offsetX, e.offsetY];
  }
}

// 清除畫布
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 觸摸事件處理，調整筆觸大小
function handleTouchMove(e) {
  if (e.touches.length > 0) {
    // 根據觸摸壓力來調整筆壓
    if (e.touches[0].force) {
      pressure = e.touches[0].force;  // 觸摸壓力範圍是 0 到 1
    } else {
      pressure = 1; // 如果裝置不支持壓力感應，則設為最大筆壓
    }
  }
}



// 監聽畫布事件
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// 觸控事件
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', (e) => {
  draw(e);
  handleTouchMove(e);
});
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// 清除按鈕事件
clearBtn.addEventListener('click', clearCanvas);

// 調整畫布大小

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 計算對比色（簡單示範：可根據需要修改此方法）

function getContrastColor(color) {
  const rgb = color.match(/\d+/g);
  const brightness = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return brightness > 128 ? '#000000' : '#FFFFFF';  // 返回黑色或白色
}

const canvas2 = document.getElementById('canvas'); // 替換為你的 Canvas ID

canvas2.addEventListener('touchmove', function(event) {
  event.preventDefault(); // 阻止 touchmove 的預設行為，包括下拉重新整理
}, { passive: false }); // passive: false 是必要的，才能調用 preventDefault()

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
