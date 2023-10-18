import "./style.css";

//----------------------------class def + helper functions-------------------------------------------------------
class LineCommand {
  points: { x: number; y: number }[];
  length: number;
  weight: number;
  color: string;

  constructor(x: number, y: number, weight: number, color: string) {
    this.points = [{ x, y }];
    this.length = 1;
    this.weight = weight;
    this.color = color;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.weight;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
    const { x, y } = this.points[0];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  extend(x: number, y: number) {
    this.points.push({ x, y });
    this.length++;
  }
}
class CursorComand {
  x: number;
  y: number;
  size: number;
  color: string;
  constructor(x: number, y: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = size * 4;
    this.color = color;
  }
  display(ctx: CanvasRenderingContext2D) {
    const originalFillStyle = ctx.fillStyle;
    ctx.fillStyle = this.color;
    ctx.font = `${Math.max(7, this.size)}px monospace`;
    if (this.size <= 4) {
      ctx.fillText("+", this.x - 2, this.y + 3);
    } else {
      ctx.fillText("+", this.x - 8, this.y + 3);
    }
    ctx.fillStyle = originalFillStyle;
  }
}

// notify observer of change by dispatching a new event
function notifyChange(name: string) {
  canvas.dispatchEvent(new Event(name));
}

//redrar
function redraw() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((line) => {
    if (line.length) {
      line.display(ctx);
    }
  });
  if (cursorComand) cursorComand.display(ctx);
}

//--------------------------------create HTML elements + canvas + global vars ------------------------------------------------
// set up main div
const app: HTMLDivElement = document.querySelector("#app")!;
// title
const gameName = "StickerPAD";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
// create canvas
const canvasWidth = 500;
const canvasHeight = 500;
const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "beige";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
// create canvas container div
const leftContainer = document.createElement("div");
leftContainer.id = "left-container";
// create button div
const buttons = document.createElement("div");
buttons.id = "button-container";
leftContainer.append(header, canvas, buttons); //buttons + canvas inside canvas container
// create marker tools
const markerTools = document.createElement("div");
markerTools.id = "marker-tools";
const subhead = document.createElement("h2");
subhead.innerText = "Marker Tools";
markerTools.appendChild(subhead);

//set up pen tools
let penDown = false;
let commands: LineCommand[] = [];
let redoStack: LineCommand[] = [];
let lineWidth = 1;
let penColor = "black";
const colors = ["black", "red", "blue", "green", "orange", "white", "yellow"];
let cursorComand: CursorComand | null = null;

//---------------------------------create buttons---------------------------------------------------------
//clear canvas button
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
//clear canvas when button is clicked
clearButton.addEventListener("click", () => {
  commands = []; //clear stroke history
  redoStack = [];
  notifyChange("drawing-changed");
});
buttons.appendChild(clearButton);
// undo button
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.addEventListener("click", () => {
  if (!commands.length) return;
  redoStack.push(commands.pop()!);
  notifyChange("drawing-changed");
});
buttons.appendChild(undoButton);
// redo button
const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.addEventListener("click", () => {
  if (!redoStack.length) return;
  commands.push(redoStack.pop()!);
  notifyChange("drawing-changed");
});
buttons.appendChild(redoButton);
// line width button
const lineWidthButton: HTMLButtonElement = document.createElement("button");
lineWidthButton.innerText = `${lineWidth}px`;
lineWidthButton.addEventListener("click", () => {
  lineWidth = lineWidth < 10 ? lineWidth + 1 : 1;
  ctx.lineWidth = lineWidth;
  lineWidthButton.innerText = `${lineWidth}px`;
  if (cursorComand) cursorComand.size = lineWidth;
  notifyChange("tool-moved");
});
//button to change pen color
const colorButton: HTMLButtonElement = document.createElement("button");
colorButton.innerText = `${penColor}`;
colorButton.addEventListener("click", () => {
  for (let i = 0; i < colors.length; i++) {
    if (penColor === colors[i]) {
      penColor = i < colors.length - 1 ? colors[i + 1] : colors[0];
      break;
    }
  }
  colorButton.innerText = `${penColor}`;
  if (penColor === "white" || penColor === "yellow") {
    colorButton.style.color = "black";
  } else {
    colorButton.style.color = "white";
  }
  colorButton.style.backgroundColor = penColor;
});
// add buttons for pen marker tools
markerTools.append(lineWidthButton, colorButton);

//---------------------------------event listeners--------------------------------------------
canvas.addEventListener("mousedown", (e) => {
  console.log("down");
  penDown = true;
  //start new line with fist point
  commands.push(new LineCommand(e.offsetX, e.offsetY, lineWidth, penColor));
  redoStack = [];
});
canvas.addEventListener("mousemove", (e) => {
  if (penDown) {
    cursorComand = null;
    console.log("draw");
    commands[commands.length - 1].extend(e.offsetX, e.offsetY);
    commands[commands.length - 1].display(ctx);
    cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  }
  cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  notifyChange("tool-moved");
});
canvas.addEventListener("mouseout", () => {
  penDown = false;
  console.log("leave");
});
canvas.addEventListener("mouseenter", (e) => {
  cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  notifyChange("tool-moved");
});
document.addEventListener("mouseup", () => {
  penDown = false;
  //clear currentLine
  console.log("up");
});
// observer for tool-moved event
canvas.addEventListener("tool-moved", () => {
  redraw();
});
// observer for drawing-changed event - clears and redraws canvas
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

//-------------------------add HTML Elements to main app div------------------------------------------
app.append(leftContainer, markerTools);
