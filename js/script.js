const NUM_META_COLS = 2;
var timerData = [[]];

var currentTime = 0;
var currentTimer = 0;
var currentInterval = 0;
var currentSample = 0;
var currentDataset = 0;
var isCycleActive = false;
var numTimers;

window.onload = (() => {
  numTimers = document.getElementsByClassName("timeDisplay").length;
});

setInterval(() => {
  currentTime += 0.01;

  if (isCycleActive) {
    document.getElementById("timerCurrentTime" + currentTimer.toString()).textContent = (timerData.at(currentSample).at(currentTimer).totalTime + currentTime).toFixed(2).toString() + "s";
  }
}, 10);

function handleCycleTimer() {
  if (!isCycleActive) {
    initTimer();
  }
  else {
    updateCycleData();
  }
}

function initTimer() {
  currentTimer = 0;
  currentTime = 0;
  currentInterval = 0;
  isCycleActive = true;

  // update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/cycle.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4dfff";
  document.getElementById("stop").disabled = false;

  initSampleData();
  initTable();
}

function initSampleData() {
  const sampleData = [];
  for (let i = 0; i < numTimers; i++) {
    sampleData.push({
      data: [],
      totalTime: 0
    })
  };

  timerData[currentSample] = sampleData;
}

function initTable() {
  const table = document.getElementById("tableData" + currentDataset.toString());

  console.log(table);

  if (!table) {
    console.log("erer")
    createTable();
  }
}

function createTable() {
  const timerDataContainer = document.getElementById("timerData");
  const timerTitles = [...document.getElementsByClassName("timerTitle")];

  table = document.createElement("table");
  table.setAttribute("id", "tableData" + currentDataset.toString());

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

  currentTimer = (currentTimer + 1) % numTimers;
  currentInterval = (currentTimer == 0) ? currentInterval + 1 : currentInterval;
}

function updateCurrentTimerData() {
  const cycleTime = currentTime;
  currentTime = 0;

  // save time
  timerData.at(currentSample).at(currentTimer).data.push(cycleTime);
  timerData.at(currentSample).at(currentTimer).totalTime += cycleTime;

  // update table
  const table = document.getElementById("tableData" + currentDataset.toString());
  let tableRow = document.getElementById("Sample" + currentSample.toString() + "Row" + currentInterval.toString());

  if (!tableRow) { // initialize new row for first sample
    tableRow = initRow();
  }

  const tableData = document.createElement("td");
  tableData.setAttribute("id", "Sample" + currentSample.toString() + "Row" + currentInterval.toString() + "Col" + (currentTimer + NUM_META_COLS).toString());
  tableData.textContent = cycleTime.toFixed(2);
  tableRow.appendChild(tableData);
  table.appendChild(tableRow);
}

function initRow() {
  let tableRow = document.createElement("tr");
  tableRow.setAttribute("id", "Sample" + currentSample.toString() + "Row" + currentInterval.toString());
  const sampleColumn = document.createElement("td");
  sampleColumn.textContent = (currentSample + 1);
  const intervalColumn = document.createElement("td");
  intervalColumn.textContent = currentInterval + 1;
  tableRow.appendChild(sampleColumn);
  tableRow.appendChild(intervalColumn);

  return tableRow;
}

function handleStopTimer() {
  updateCurrentTimerData();

  const tableId = "tableData" + currentDataset.toString();
  const table = document.getElementById(tableId);
  const tableRow = document.getElementById("Sample" + currentSample.toString() + "Row" + currentInterval.toString());

  // fill missing columns
  for (let i = currentTimer + 1; i < numTimers; i++) {
    const tableData = document.createElement("td");
    tableData.setAttribute("id", tableId + "Col" + (i + NUM_META_COLS).toString());
    tableData.textContent = 0.00;
    tableRow.appendChild(tableData);
  }

  // sum timer totals
  const totalTimeRow = document.createElement("tr");

  const intervalColumn = document.createElement("td");
  intervalColumn.textContent = "Totals";
  intervalColumn.style.fontWeight = "bold";
  totalTimeRow.appendChild(intervalColumn);

  const sampleColumn = document.createElement("td");
  sampleColumn.textContent = "";
  totalTimeRow.appendChild(sampleColumn);

  for (let i = 0; i < numTimers; i++) {
    const tableData = document.createElement("td");
    tableData.setAttribute("id", tableId + "Col" + (i + NUM_META_COLS).toString());
    tableData.textContent = timerData.at(currentSample).at(i).totalTime.toFixed(2);
    totalTimeRow.appendChild(tableData);
  }

  table.appendChild(totalTimeRow);

  isCycleActive = false;
  // update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/play.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4ffc6";

  for (let i = 0; i < numTimers; i++) {
    document.getElementById("timerCurrentTime" + i.toString()).textContent = "0.00s";
  }

  // disable stop button
  document.getElementById("stop").disabled = true;
  currentSample += 1;
}