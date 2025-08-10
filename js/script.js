
const NUM_META_COLS = 2;
var timerData = [];

var currentTime = 0;
var currentTimer = 0;
var currentInterval = 0;
var currentSample = 0;
var currentDataset = 0;
var isCycleActive = false;
var numTimers;

// table row format: timerData<currentDataset>Row<currentTimer>

window.onload = (() => {
  numTimers = document.getElementsByClassName("timeDisplay").length;
})

setInterval(() => {
  currentTime += 0.01;

  if (isCycleActive) {
    document.getElementById("timerCurrentTime" + currentTimer.toString()).textContent = (timerData.at(currentTimer).totalTime + currentTime).toFixed(2).toString() + "s";
  }
}, 10)

function handleCycleTimer() {
  if (!isCycleActive) {
    initTimer();
  }
  else {
    updateCycleData();
  }
}

function initTimer() {
  // initialize timer data
  for (let i = 0; i < numTimers; i++) {
    timerData.push({
      data: [],
      totalTime: 0
    })
  };
  currentTimer = 0;
  currentTime = 0;
  isCycleActive = true;

  // update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/cycle.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4dfff";

  initTable();

  // enable stop button
  document.getElementById("stop").disabled = false;
}

function initTable() {
  const timerDataContainer = document.getElementById("timerData");
  const timerTitles = [...document.getElementsByClassName("timerTitle")];
  const tables = [...timerDataContainer.getElementsByTagName("table")];
  let table = tables.at(currentDataset);

  table = document.createElement("table");
  table.setAttribute("id", "timerData" + currentDataset.toString());
  const tableHead = document.createElement("thead");
  const timeSampleHeader = document.createElement("th");
  timeSampleHeader.textContent = "Sample";
  const timeIntervalHeader = document.createElement("th");
  timeIntervalHeader.textContent = "Interval";
  tableHead.appendChild(timeSampleHeader);
  tableHead.appendChild(timeIntervalHeader);

  for (let i = 0; i < numTimers; i++) {
    const timerHeader = document.createElement("th");
    timerHeader.textContent = [...timerTitles.at(i).getElementsByTagName("input")].at(0).value;
    tableHead.appendChild(timerHeader);
  }

  table.appendChild(tableHead);
  timerDataContainer.appendChild(table);

}

function updateCycleData() {
  updateCurrentTimerData();

  // next timer
  currentTimer = (currentTimer + 1) % timerData.length;
}

function updateCurrentTimerData() {
  const cycleTime = currentTime;
  currentTime = 0;

  // save time
  timerData.at(currentTimer).data.push(cycleTime);
  timerData.at(currentTimer).totalTime += cycleTime;

  // update table
  const tableId = "timerData" + currentDataset.toString();
  const table = document.getElementById(tableId);
  const numRows = table.getElementsByTagName("tr").length;
  let tableRow = document.getElementById("Sample" + currentDataset.toString() + "Row" + (timerData.at(currentTimer).data.length - 1).toString());

  if (!tableRow) { // initialize new row for first timer
    tableRow = document.createElement("tr");
    tableRow.setAttribute("id", "Sample" + currentDataset.toString() + "Row" + numRows.toString());
  }
  if (tableRow.getElementsByTagName("td").length == 0) { // initialize sample/interval label row
    const sampleColumn = document.createElement("td");
    sampleColumn.textContent = (currentDataset + 1);
    const intervalColumn = document.createElement("td");
    intervalColumn.textContent = (numRows + 1);
    tableRow.appendChild(sampleColumn);
    tableRow.appendChild(intervalColumn);
  }

  const tableData = document.createElement("td");
  tableData.setAttribute("id", tableId + "Col" + (currentTimer + NUM_META_COLS).toString());
  tableData.textContent = cycleTime.toFixed(2);
  tableRow.appendChild(tableData);
  table.appendChild(tableRow);
}

function handleStopTimer() {
  updateCurrentTimerData();

  const tableId = "timerData" + currentDataset.toString();
  const table = document.getElementById(tableId);
  const numRows = table.getElementsByTagName("tr").length;
  const tableRow = document.getElementById("Sample" + currentDataset.toString() + "Row" + (timerData.at(currentTimer).data.length - 1).toString());

  // fill missing columns
  for (let i = currentTimer + 1; i < numTimers; i++) {
    const tableData = document.createElement("td");
    tableData.setAttribute("id", tableId + "Col" + (i + NUM_META_COLS).toString());
    tableData.textContent = 0.00;
    tableRow.appendChild(tableData);
  }

  // sum timer totals
  const tableFoot = document.createElement("tr");

  const intervalColumn = document.createElement("td");
  intervalColumn.textContent = "Totals";
  intervalColumn.style.fontWeight = "bold";
  tableFoot.setAttribute("id", tableId + "Row" + numRows.toString());
  tableFoot.appendChild(intervalColumn);

  const sampleColumn = document.createElement("td");
  sampleColumn.textContent = "";
  tableFoot.appendChild(sampleColumn);

  for (let i = 0; i < numTimers; i++) {
    const tableData = document.createElement("td");
    tableData.setAttribute("id", tableId + "Col" + (i + NUM_META_COLS).toString());
    tableData.textContent = timerData.at(i).totalTime.toFixed(2);
    tableFoot.appendChild(tableData);
  }

  table.appendChild(tableFoot);

  isCycleActive = false;
  // update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/play.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4ffc6";

  for (let i = 0; i < numTimers; i++) {
    document.getElementById("timerCurrentTime" + i.toString()).textContent = "0.00s";
  }

  // disable stop button
  document.getElementById("stop").disabled = true;
  currentDataset += 1;
  timerData = [];
}

function handleEditTimerTitle(e) {
  const icon = e.target;
  icon.style.visibility = "hidden";
  const timerTitle = icon.parentElement;
  console.log(timerTitle)
  const input = [...timerTitle.getElementsByTagName("input")].at(0);
  console.log([...timerTitle.getElementsByTagName("input")]);
  input.style.visibility = "visible";
  input.focus;
}

function handleSaveTimerTitle(e) {
  const input = e.target;
  const timerTitle = input.parentElement;

  // Find and update only the text span
  const titleText = timerTitle.querySelector(".title-text");
  if (titleText) {
    titleText.textContent = input.value;
  }

  input.style.visibility = "hidden";

  const icon = timerTitle.querySelector("img");
  if (icon) {
    icon.style.visibility = "visible";
  }
}
