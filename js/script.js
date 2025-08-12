const NUM_META_COLS = 2;
var timerData = [[]];
var currentTime = 0;
var currentTimer = 0;
var currentInterval = 0;
var currentSample = 0;
var currentDataset = 0;
var isCycleActive = false;
var numTimers;
var lastTime = null; // To track the last timestamp
var accumulatedTime = 0; // To accumulate time for 10ms updates

window.onload = (() => {
  numTimers = document.getElementsByClassName("timeDisplay").length;
  startTimerUpdate(); // Start the timer update loop
});

function startTimerUpdate() {
  function updateTimer(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000; // Convert ms to seconds
    lastTime = timestamp;
    accumulatedTime += delta;

    // Update every 10ms (0.01s)
    while (accumulatedTime >= 0.01) {
      if (isCycleActive) {
        currentTime += 0.01; // Increment by 0.01s, matching original setInterval
        document.getElementById(`timerCurrentTime${currentTimer}`).textContent =
          (timerData.at(currentSample).at(currentTimer).totalTime + currentTime).toFixed(2) + "s";
      }
      accumulatedTime -= 0.01; // Subtract 10ms from accumulated time
    }

    requestAnimationFrame(updateTimer); // Schedule the next frame
  }

  requestAnimationFrame(updateTimer); // Start the animation loop
}

function handleCycleTimer() {
  if (!isCycleActive) {
    initTimer();
  } else {
    cycleTimers();
  }
}

function initTimer() {
  currentTimer = 0;
  currentTime = 0;
  currentInterval = 0;
  isCycleActive = true;

  // Update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/cycle.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4dfff";
  document.getElementById("stop").disabled = false;

  initSampleData();
}

function initSampleData() {
  const sampleData = [];
  for (let i = 0; i < numTimers; i++) {
    sampleData.push({
      data: [],
      totalTime: 0
    });
  }
  timerData[currentSample] = sampleData;
}

function cycleTimers() {
  updateCurrentTimerData();
  currentTimer = (currentTimer + 1) % numTimers;
  currentInterval = currentTimer === 0 ? currentInterval + 1 : currentInterval;
}

function updateCurrentTimerData() {
  const cycleTime = currentTime;
  currentTime = 0; // Reset currentTime for the next timer

  // Save time
  timerData.at(currentSample).at(currentTimer).data.push(cycleTime);
  timerData.at(currentSample).at(currentTimer).totalTime += cycleTime;

  // Update table
  let table = document.getElementById("tableData" + currentDataset.toString());
  if (!table) {
    table = createTable();
  }

  let tableRow = document.getElementById("Sample" + currentSample.toString() + "Row" + currentInterval.toString());
  if (!tableRow) {
    tableRow = initRow();
  }

  const tableData = document.createElement("td");
  tableData.setAttribute("id", "Sample" + currentSample.toString() + "Row" + currentInterval.toString() + "Col" + (currentTimer + NUM_META_COLS).toString());
  tableData.textContent = cycleTime.toFixed(2);
  tableRow.appendChild(tableData);
  table.appendChild(tableRow);
}

function createTable() {
  const timerDataContainer = document.getElementById("timerData");
  const tableContainer = document.createElement("div");
  tableContainer.setAttribute("class", "tableContainer");

  const timerTitles = [...document.getElementsByClassName("timerTitle")];

  const table = document.createElement("table");
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

  const breaker = document.createElement("hr");
  breaker.style.backgroundColor = "black";
  breaker.style.minWidth = "60%";
  breaker.style.margin = "2rem 0 0 0";
  table.appendChild(tableHead);
  tableContainer.appendChild(breaker);
  tableContainer.appendChild(table);
  tableContainer.appendChild(createTableButtons());
  timerDataContainer.appendChild(tableContainer);

  return table;
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

  // update display
  document.getElementById("cycleImg").setAttribute("src", "./assets/svg/play.svg");
  document.getElementById("cycle").style.backgroundColor = "#c4ffc6";
  document.getElementById("stop").disabled = true;
  for (let i = 0; i < numTimers; i++) {
    document.getElementById("timerCurrentTime" + i.toString()).textContent = "0.00s";
  }

  currentSample += 1;
  isCycleActive = false;
}

function handleCopyTable(e) {
  const tableElement = [...e.target.parentElement.parentElement.parentElement.getElementsByTagName("table")].at(0);
  if (!tableElement) {
    console.error("Table not found!");
    return;
  }

  let plainTextData = "";
  const rows = tableElement.querySelectorAll("tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("th, td");
    const rowData = Array.from(cells).map(cell => cell.innerText.trim()).join("\t");
    plainTextData += rowData + "\n";
  });

  const htmlData = tableElement.outerHTML;

  const plainTextBlob = new Blob([plainTextData], { type: "text/plain" });
  const htmlBlob = new Blob([htmlData], { type: "text/html" });

  const clipboardItem = new ClipboardItem({
    "text/plain": plainTextBlob,
    "text/html": htmlBlob
  });

  navigator.clipboard.write([clipboardItem])
    .then(() => {
      console.log("Table copied to clipboard successfully!");
    })
    .catch(err => {
      console.error("Failed to copy table:", err);
    });
}

function handleDownloadTable(e) {
  let csv = "";
  const tableElement = [...e.target.parentElement.parentElement.parentElement.getElementsByTagName("table")].at(0);
  const filename = tableElement.id + ".csv";

  const rows = tableElement.querySelectorAll("thead, tr");
  for (const row of rows) {
    const cells = row.querySelectorAll("td, th");
    const rowText = Array.from(cells).map(cell => cell.innerText);
    const quotedRowText = rowText.map(text => {
      return text;
    });
    console.log(quotedRowText.join(","));
    csv += (quotedRowText.join(",") + "\n");
  }

  downloadCSV(filename, csv);
}

function downloadCSV(filename, text) {
  const blob = new Blob([text], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createTableButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("class", "buttonContainer");
  const copyButton = document.createElement("button");
  copyButton.addEventListener("click", (e) => handleCopyTable(e));
  copyButton.innerText = "Copy data";

  const downloadButton = document.createElement("button");
  downloadButton.addEventListener("click", (e) => handleDownloadTable(e));
  downloadButton.innerText = "Download csv";
  // const copyImg = document.createElement("img");
  // copyImg.setAttribute("src", "./assets/svg/copy.svg");

  // copyButton.appendChild(copyImg);
  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(downloadButton);

  return buttonContainer;
}