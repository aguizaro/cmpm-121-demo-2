import "./style.css";

function drawPath(e: MouseEvent) {
  if (!penDown) return;
  // pen style
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  // line to new position
  ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  ctx.stroke();
  // new path for next segment
  ctx.beginPath();
  ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}
// set up main div
const app: HTMLDivElement = document.querySelector("#app")!;
// title
const gameName = "StickerPAD";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;

// create canvas
const canvasWidth = 256;
const canvasHeight = 256;
const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "beige";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

//clear canvas button
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
//clear canvas when button is clicked
clearButton.addEventListener("click", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "beige";
});
let penDown = false;
//Set up listners for mouse to draw
document.addEventListener("mousedown", () => {
  console.log("down");
  penDown = true;
  ctx.beginPath();
});
document.addEventListener("mouseup", () => {
  console.log("up");
  penDown = false;
});
canvas.addEventListener("mousemove", (e) => {
  console.log("draw");
  drawPath(e);
});
// avoids weird line segments when pen is down, exits canvas, and then enters canvas in new location
canvas.addEventListener("mouseenter", () => {
  console.log("enter canvas");
  ctx.beginPath();
});

//Todo: make it so players can click to make a dot (mousedown -> mouseup = dot)

app.append(header, canvas, clearButton);
