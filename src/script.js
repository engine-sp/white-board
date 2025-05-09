// 獲取畫布元素和上下文
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
ctx.strokeStyle = contrastColor;  // 設定畫筆顏色
ctx.lineWidth = 5;  // 設定畫筆寬度
ctx.lineCap = 'round';  // 設定畫筆圓角



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
  ctx.lineCap = 'round';  // 設定畫筆圓角
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
      pressure = e.touches[0].force;  // 觸摸壓力範圍是 0 到 1
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
  return brightness > 128 ? '#000000' : '#FFFFFF';  // 返回黑色或白色
}