const DEFAULT_CHARS = '@#S%?*+;:,. ';
const COLS = 120;
const FONT_SIZE = 7;

let currentMode = 'white';
let video, canvas, ctx, output, octx, customCharsInput;

function getChars() {
  const val = customCharsInput.value.trim();
  return val.length > 0 ? val + ' ' : DEFAULT_CHARS;
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('#color-controls .btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function getColor(R, G, B, brightness) {
  if (currentMode === 'white') return '#ffffff';
  if (currentMode === 'grey') {
    const v = Math.floor(brightness);
    return `rgb(${v},${v},${v})`;
  }
  if (currentMode === 'green') {
    const v = Math.floor(brightness);
    return `rgb(0,${v},${Math.floor(v * 0.3)})`;
  }
  if (currentMode === 'color') return `rgb(${R},${G},${B})`;
}

function drawAscii(imageData, width, height) {
  const CHARS = getChars();
  const cellW = width / COLS;
  const cellH = cellW * 2;
  const rows = Math.floor(height / cellH);

  output.width = COLS * FONT_SIZE;
  output.height = rows * (FONT_SIZE * 2);

  octx.fillStyle = '#0a0a0f';
  octx.fillRect(0, 0, output.width, output.height);
  octx.font = `${FONT_SIZE * 2}px "Courier New"`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = Math.floor(c * cellW);
      const y = Math.floor(r * cellH);
      const i = (y * width + x) * 4;

      const R = imageData.data[i];
      const G = imageData.data[i + 1];
      const B = imageData.data[i + 2];
      const brightness = R * 0.299 + G * 0.587 + B * 0.114;

      const charIdx = Math.floor((brightness / 255) * (CHARS.length - 1));
      const char = CHARS[charIdx];

      octx.fillStyle = getColor(R, G, B, brightness);
      octx.fillText(char, c * FONT_SIZE, r * (FONT_SIZE * 2));
    }
  }
}

function loop() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawAscii(imageData, canvas.width, canvas.height);
  requestAnimationFrame(loop);
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    requestAnimationFrame(loop);
  };
}

function takeScreenshot() {
  const link = document.createElement('a');
  link.download = 'asciimezs.png';
  link.href = output.toDataURL('image/png');
  link.click();
}

window.onload = function() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  output = document.getElementById('output');
  octx = output.getContext('2d');
  customCharsInput = document.getElementById('custom-chars');
  startCamera();
};
