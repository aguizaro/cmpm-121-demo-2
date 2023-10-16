import "./style.css";

//------------------------------------------------------------------------------------

function notifyChange() {
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
}
// Draw line segments if pen is down
function addPoint(e: MouseEvent) {
  // pen style
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  //add points to current stroke
  currentStroke.push({
    x: e.offsetX,
    y: e.offsetY,
  });
  notifyChange();
}

// clear canvas and redraw all line segments
function redraw() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  penStrokes.forEach((stroke) => {
    if (stroke.length > 1) {
      ctx.beginPath();
      stroke.forEach((point) => {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
    }
  });
}

//

// undo last stroke and add it to redoStack
function undo() {
  if (penStrokes.length < 1) return;
  redoStack.push(penStrokes.pop()!);
  notifyChange();
}
// redo last stroke and add pop it from redoStack
function redo() {
  if (redoStack.length < 1) return;
  penStrokes.push(redoStack.pop()!);
  notifyChange();
}

//-------------------------------------------------------------------------------------
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
clearButton.classList.add("button-container");
//clear canvas when button is clicked
clearButton.addEventListener("click", () => {
  penStrokes.length = 0; //clear stroke history
  currentStroke = [];
  redoStack.length = 0;
  notifyChange();
  //penStrokes.push(currentStroke); //add reference to current stroke - current is updated with points when user draws (*important*)
});
// undo button
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("button-container");
undoButton.addEventListener("click", () => {
  undo();
});
// redo button
const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  redo();
});

//------------------------------------------------------------------------------------
//set up pen tools
let penDown = false;
const penStrokes: { x: number; y: number }[][] = [];
let currentStroke: { x: number; y: number }[] = [];
const redoStack: { x: number; y: number }[][] = [];
//penStrokes.push(currentStroke); //add reference to current stroke to see live updates when re-drawing

//Set up listners for mouse to draw
canvas.addEventListener("mousedown", (e) => {
  penDown = true;
  currentStroke = [];
  penStrokes.push(currentStroke);
  redoStack.splice(0, redoStack.length);
  currentStroke.push({ x: e.offsetX, y: e.offsetY });
  notifyChange();
});
canvas.addEventListener("mousemove", (e) => {
  if (penDown) addPoint(e);
});
canvas.addEventListener("mouseup", () => {
  penDown = false;
  currentStroke = []; // clear current stroke points
});

// avoids weird line segments when pen is down, exits canvas, and then enters canvas in new location
canvas.addEventListener("mouseleave", () => {
  if (currentStroke.length > 0) penStrokes.push(currentStroke.slice()); // add current stroke to strokes array
  currentStroke = [];
});
// observer for drawing-changed event - clears and redraws canvas
canvas.addEventListener("drawing-changed", () => {
  redraw();
});
//------------------------------------------------------------------------------------

//Todo: make it so players can click to make a dot (mousedown -> mouseup = dot)

app.append(header, canvas, clearButton, undoButton, redoButton);
