let focusIndex = 0;
let focusRound = 0;
let currentRound;
let currentInputs;
function isFilled(elems) {
    return (elems[0].textContent + elems[1].textContent + elems[2].textContent).trim() !== "";
}

function sumThree(elems) {
    return scoreValue(elems[0]) + scoreValue(elems[1]) + scoreValue(elems[2])
}

const scoreValue = (input) => {
    const value = input.textContent.toUpperCase();
    if (value === "X") return 10;
    if (value === "M") return 0;
    const intValue = parseInt(value);
    if (isNaN(intValue) || intValue < 0 || intValue > 10) return 0;
    return intValue;
};


function calculateScore() {
    calculateScoreFor(currentRound);
}

function calculateScoreFor(round) {

    let roundTotal = 0;
    for (let i = 0; i < 6; i++) {
        const endIndex = i * 2;
        const startIndex = i * 6;

        let firstThree = round.inputs.slice(startIndex, startIndex + 3);
        const sum1 = sumThree(firstThree);
        let laterThree = round.inputs.slice(startIndex + 3, startIndex + 6);
        const sum2 = sumThree(laterThree);
        const sum1Filled = isFilled(firstThree)
        const sum2Filled = isFilled(laterThree)
        const endTotal = sum1 + sum2;

        round.scoreTable.rows[endIndex].cells[4].textContent = sum1Filled ? sum1 : ""; // 1-3 sum
        round.scoreTable.rows[endIndex + 1].cells[3].textContent = sum2Filled ? sum2 : ""; // 4-6 sum
        roundTotal += endTotal;
        round.scoreTable.rows[endIndex].cells[5].textContent = sum1Filled || sum2Filled ? endTotal : ""; // 6本計
        const endOver50 = endTotal >= 50;
        if (endOver50) {
            round.scoreTable.rows[endIndex].cells[5].classList.add("over50");
        } else {
            round.scoreTable.rows[endIndex].cells[5].classList.remove("over50");
        }
        round.scoreTable.rows[endIndex].cells[6].textContent = i !== 0 && (sum1Filled || sum2Filled) ? roundTotal : "";
        const totalOver50 = roundTotal >= 50 * (i + 1);
        if (totalOver50) {
            round.scoreTable.rows[endIndex].cells[6].classList.add("over50");
        } else {
            round.scoreTable.rows[endIndex].cells[6].classList.remove("over50");
        }
    }
    round.roundTotal = roundTotal;
    round.totalElement.innerText = roundTotal;


    let xCount = 0;
    let tenCount = 0;

    round.inputs.forEach((input) => {
        const value = input.innerText;
        if (value === "X") {
            xCount++;
            tenCount++;
        }
        if (value === "10") {
            tenCount++;
        }
    });
    round.tenCount = tenCount;
    round.xCount = xCount;
    round.tenCountElement.textContent = tenCount;
    round.xCountElement.textContent = xCount;

    round.runningTotalElement.textContent = rounds.reduce((accumulator, currentRound) => accumulator + currentRound.roundTotal, 0);
    round.runningTenCountElement.textContent = rounds.reduce((accumulator, currentRound) => accumulator + currentRound.tenCount, 0);
    round.runningXCountElement.textContent = rounds.reduce((accumulator, currentRound) => accumulator + currentRound.xCount, 0);

}


const moveFocus = (direction) => {
    const newIndex = Math.max(0,focusIndex + direction);
    if (newIndex === focusIndex) {
        return;
    }
    unfocus(focusIndex);
    focus(newIndex);
    focusIndex = newIndex;
};

function focus(index) {
    if (index < currentRound.inputs.length) {
        const elem = currentRound.inputs[index];
        elem.classList.add("inner-outline");
        elem.scrollIntoView({behavior: "smooth", block: "start"});
    }
}

function unfocus(index) {
    if (index < currentRound.inputs.length) {
        const elem = currentRound.inputs[index];
        elem.classList.remove("inner-outline");
    }
}

let touchStartX = 0;
let touchEndX = 0;
let flickThreshold = 30;
let flickCounter = 0;
let flickMinIndex = 0;

function handleTouchStart(event) {
    flickMinIndex = focusIndex - focusIndex % 6;
    touchStartX = event.touches[0].clientX;
    flickCounter = 0;
    buttonPressed(event);
}

function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;

    let distance = touchEndX - touchStartX;
    let numberOfFlicks = Math.floor(distance / flickThreshold);

    if (numberOfFlicks === flickCounter) {
        return;
    }

    if (numberOfFlicks > flickCounter && focusIndex < (flickMinIndex + 6)) {
        buttonPressed(event);
        flickCounter = numberOfFlicks;
    }
    if (-1 <= numberOfFlicks && numberOfFlicks < flickCounter && flickMinIndex < focusIndex) {
        backSpace();
        calculateScore(currentRound);
        flickCounter = numberOfFlicks;
    }
}

const onScreenKeyboardBtns = keyboard.querySelectorAll("td");

onScreenKeyboardBtns.forEach(btn => {
    if (btn.dataset.value) {
        if ('ontouchstart' in document.documentElement && btn.dataset.value !== "del") {
            btn.addEventListener('touchstart', handleTouchStart, false);
            btn.addEventListener('touchmove', handleTouchMove, false);
        } else {
            btn.addEventListener("click", buttonPressed);
        }
    }
});

function setPlusButtonVisibility() {
    if (currentInputs[currentInputs.length - 1].innerText.trim() !== "") {
        plusButton.style.display = "block";
    } else {
        plusButton.style.display = "none";
    }
}

function buttonPressed(e) {
    e.preventDefault();
    const value = e.target.dataset.value;

    if (value === "del") {
        backSpace();
    } else {
        if (focusIndex !== currentInputs.length) {
            setCellValue(currentInputs[focusIndex], value);
            moveFocus(1);
        }
    }
    setPlusButtonVisibility();

    saveToURL();
    setTimeout(calculateScore, 50);
}

function saveToURL() {
    const score = rounds.map(e => e.inputs.map(input => input.textContent.trim()).join('')).join('&score=');
    const date = rounds.map(e => e.dateDisplay.innerText).join('&date=');
    const distance = rounds.map(e => e.distance.innerText).join('&distance=');
    history.replaceState("", "", `?date=${date}&distance=${distance}&score=${score}`);
}

function setCellValue(inputElem, value) {
    inputElem.classList.remove(getColorClassName(inputElem.innerText))
    inputElem.innerHTML = value;
    inputElem.classList.add(getColorClassName(value))
}

function backSpace() {
    if (focusIndex < currentRound.inputs.length) {
        setCellValue(currentRound.inputs[focusIndex], "&nbsp;");
    }
    moveFocus(-1);
    setCellValue(currentRound.inputs[focusIndex], "&nbsp;");
}

function getColorClassName(value) {
    if (value === "X" || value === "10" || value === "9") {
        return "yellow-circle";
    }
    if (value === "8" || value === "7") {
        return "red-circle";
    }
    if (value === "6" || value === "5") {
        return "blue-circle";
    }
    if (value === "4" || value === "3") {
        return "black-circle";
    }
    return "white-circle";
}

const roundTemplate = document.getElementById("round-template");

function Round(distance, date, scoreString) {
    rounds[rounds.length] = this;
    if (currentInputs) {
        unfocus(focusIndex);
    }

    currentRound = this;
    const round  = roundTemplate.cloneNode(true);
    document.getElementById("scores").appendChild(round);
    round.style.display = "block";
    this.scoreTable = round.getElementsByClassName("score-table").item(0);
    for (let i = 1; i <= 6; i++) {
        this.scoreTable.insertRow().innerHTML = `
                <td rowspan="2">${i}</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
                <td rowspan="2"></td>
                <td rowspan="2"></td>
            `;
        this.scoreTable.insertRow().innerHTML = `
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
            `;
    }
    setVisibility(this.scoreTable, distance);

    // Add event listeners to input elements
    this.inputs = currentInputs = Array.from(round.getElementsByClassName("shot"));
    let index = 0;
    if(scoreString) {
        scoreString.split('').forEach(fillScore => {
            if (fillScore !== "0") {
                setCellValue(this.inputs[index], fillScore);
                index++;
            } else {
                setCellValue(this.inputs[index - 1], "10");
            }
        });
    }
    focusIndex = index;
    focus(focusIndex);


    this.inputs.forEach(input => {
        input.addEventListener("click", (e) => {
            e.preventDefault();
            for (let i = 0; i < currentRound.inputs.length; i++) {
                if (currentRound.inputs[i] === e.target || currentRound.inputs[i].innerText.trim() === "") {
                    if (i !== focusIndex) {
                        unfocus(focusIndex);
                        focusIndex = i;
                        focus(focusIndex);
                    }
                    break;
                }
            }
        });
    });

    this.totalElement = round.getElementsByClassName("total")[0];
    this.tenCountElement = round.getElementsByClassName("ten-count")[0];
    this.xCountElement = round.getElementsByClassName("x-count")[0];
    this.runningTotalElement = round.getElementsByClassName("running-total")[0];
    this.runningTenCountElement = round.getElementsByClassName("running-ten-count")[0];
    this.runningXCountElement = round.getElementsByClassName("running-x-count")[0];
    if (rounds.length > 1) {
        round.getElementsByClassName("running")[0].style.display = "block";
    }

    this.datePicker = round.getElementsByClassName("date-picker")[0];
    this.dateDisplay = round.getElementsByClassName('date')[0];
    this.dateDisplay.addEventListener('click', () => {
        this.datePicker.focus();
        this.datePicker.click();
    });
    this.dateDisplay.innerHTML = date;

    this.datePicker.addEventListener('change', () => {
        const selectedDate = new Date(this.datePicker.value);
        this.dateDisplay.textContent = formatDate(selectedDate);
        saveToURL();
        this.datePicker.click();
    });

    this.distance = round.getElementsByClassName('distance')[0];
    this.distance.innerHTML = distance;
    this.distance.addEventListener('click', (event) => {
        distanceToBeSet = event.target;
        distanceMenu.style.display = (distanceMenu.style.display === 'block') ? 'none' : 'block';
        distanceMenu.style.left = `${event.pageX}px`;
        distanceMenu.style.top = `${event.pageY}px`;
    });
    calculateScoreFor(this);
}
function setVisibility(table, distance){
    const display = distance === "18m" ? "none" : "";
    table.rows[10].style.display = display;
    table.rows[11].style.display = display;
}

let rounds = [];

function restore() {
    const searchParams = new URLSearchParams(window.location.search);
    // restore state from URL
    let index = 0;
    const scoreStrings = searchParams.getAll("score");
    const dates = searchParams.getAll("date");
    const distances = searchParams.getAll("distance");
    if (scoreStrings.length > 0) {
        const loop = Math.min(scoreStrings.length, dates.length, distances.length);
        for (let i = 0; i < loop; i++) {
            const scoreString = scoreStrings[i];
            const date = dates[i];
            const distance = distances[i];
            const round = new Round(distance, date, scoreString);
        }

    } else {
        const date = formatDate(new Date());
        const round = new Round("70m", date);
    }
    focus(focusIndex);
}

restore();

function clearScore() {
    if (confirm("スコアを消去して良いですか?")) {
        rounds[0].inputs.forEach(input => setCellValue(input, "&nbsp;"));
        unfocus(focusIndex);
        focusIndex = 0;
        focus(focusIndex);
        removeThumbnail();
        calculateScore();
        saveToURL();
    }
}

document.getElementById("clear-button").addEventListener("click", clearScore);
const scoreElement = document.getElementById("scores");

function removeThumbnail() {
    for (let i = 0; i < scoreElement.children.length; i++) {
        let child = scoreElement.children[i];
        if (child.classList.contains("float-image")) {
            scoreElement.removeChild(child);
        }
    }
}

function downloadScreenshot() {
    html2canvas(scoreElement).then(canvas => {
        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");

        img.classList.add("float-image")
        scoreElement.appendChild(img);
        scoreElement.addEventListener("click", removeThumbnail);
    });
}

document.getElementById("save-button").addEventListener("click", downloadScreenshot);

const dotMenu = document.getElementById('dot-menu');
const popupMenu = document.getElementById('popup-menu');

dotMenu.addEventListener('click', (event) => {
    popupMenu.style.display = (popupMenu.style.display === 'block') ? 'none' : 'block';

    const menuWidth = popupMenu.offsetWidth;
    const menuHeight = popupMenu.offsetHeight;
    popupMenu.style.left = `${event.pageX - menuWidth}px`;
    popupMenu.style.top = `${event.pageY - menuHeight}px`;
});

document.addEventListener('click', (event) => {
    if (event.target !== dotMenu && event.target !== popupMenu) {
        popupMenu.style.display = 'none';
    }
})
const distanceMenu = document.getElementById('distance-menu');


let distanceToBeSet;

const plusButton = document.getElementById("plus-button");
plusButton.addEventListener('click', event => {
    distanceToBeSet = event.target;
    distanceMenu.style.display = (distanceMenu.style.display === 'block') ? 'none' : 'block';
    distanceMenu.style.left = `${event.pageX}px`;
    distanceMenu.style.top = `${event.pageY}px`;
});
document.addEventListener('click', (event) => {
    if (!event.target.classList.contains("distance") && event.target !== plusButton && event.target !== distanceMenu) {
        distanceMenu.style.display = 'none';
    }
});


Array.from(document.getElementsByClassName("distance-menu-choice")).forEach(elem => elem.addEventListener('click', (event) => {
    if (distanceToBeSet === plusButton) {
        const date = formatDate(new Date());
        new Round(elem.innerText, date);
        setPlusButtonVisibility();
    } else {
        distanceToBeSet.innerText = elem.innerText;
        const element = distanceToBeSet.parentNode.parentNode.querySelector('.score-table');
        setVisibility(element,elem.innerText);
        distanceMenu.style.display = 'none';
        saveToURL();
    }
}))

function formatDate(date) {

    const locale = navigator.language;

    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'numeric', day: 'numeric',
    });
    return formatter.format(date);
}

