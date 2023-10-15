import "./style.css";

// Draw line segments if pen is down
function drawPath(e: MouseEvent) {
  console.log("new point");
  // pen style
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  //add points to current stroke
  console.log(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  currentStroke.push([
    e.clientX - canvas.offsetLeft,
    e.clientY - canvas.offsetTop,
  ]);

  // dispatch event for observer
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
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
  penStrokes.length = 0; //clear stroke history
  currentStroke.length = 0;
  penStrokes.push(currentStroke); //add reference to current stroke - current is updated with points when user draws (*important*)
});

//set up pen tools
let penDown = false;
const penStrokes: number[][][] = [];
const currentStroke: number[][] = [];
penStrokes.push(currentStroke); //add reference to current stroke to see live updates when re-drawing

//Set up listners for mouse to draw
document.addEventListener("mousedown", () => {
  console.log("down");
  penDown = true;
  ctx.beginPath();
});
document.addEventListener("mouseup", () => {
  console.log("up");
  penDown = false;
  penStrokes.push(currentStroke.slice()); // add current stroke to strokes array
  currentStroke.length = 0; // clear current stroke points
});
canvas.addEventListener("mousemove", (e) => {
  if (penDown) drawPath(e);
});
// avoids weird line segments when pen is down, exits canvas, and then enters canvas in new location
canvas.addEventListener("mouseleave", () => {
  console.log("exit canvas");
  penStrokes.push(currentStroke.slice()); // add current stroke to strokes array
  currentStroke.length = 0;
});

// observer for drawing-changed event - clears and redraws canvas
canvas.addEventListener("drawing-changed", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  penStrokes.forEach((stroke) => {
    ctx.beginPath();
    stroke.forEach((point) => {
      ctx.lineTo(point[0], point[1]);
      ctx.stroke();
    });
  });
});

//Todo: make it so players can click to make a dot (mousedown -> mouseup = dot)

app.append(header, canvas, clearButton);
