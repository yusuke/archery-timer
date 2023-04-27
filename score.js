let focusIndex = 0;

let scoreIndex = 0;

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
    calculateScoreFor(rounds[0]);
}

function calculateScoreFor(round) {

    let runningTotal = 0;
    for (let i = 0; i < 6; i++) {
        const endIndex = i * 2;
        const startIndex = i * 6;

        let firstThree = round.inputs.slice(startIndex, startIndex + 3);
        const sum1 = sumThree(firstThree);
        let laterThree = round.inputs.slice(startIndex + 3, startIndex + 6);
        const sum2 = sumThree(laterThree);
        const sum1Filled = isFilled(firstThree)
        const sum2Filled = isFilled(laterThree)
        const total = sum1 + sum2;

        round.scoreTable.rows[endIndex].cells[4].textContent = sum1Filled ? sum1 : ""; // 1-3 sum
        round.scoreTable.rows[endIndex + 1].cells[3].textContent = sum2Filled ? sum2 : ""; // 4-6 sum
        runningTotal += total;
        round.scoreTable.rows[endIndex].cells[5].textContent = sum1Filled || sum2Filled ? total : ""; // 6本計
        const endOver50 = total >= 50;
        if (endOver50) {
            round.scoreTable.rows[endIndex].cells[5].classList.add("over50");
        } else {
            round.scoreTable.rows[endIndex].cells[5].classList.remove("over50");
        }
        round.scoreTable.rows[endIndex].cells[6].textContent = i !== 0 && (sum1Filled || sum2Filled) ? runningTotal : "";
        const totalOver50 = runningTotal >= 50 * (i + 1);
        if (totalOver50) {
            round.scoreTable.rows[endIndex].cells[6].classList.add("over50");
        } else {
            round.scoreTable.rows[endIndex].cells[6].classList.remove("over50");
        }
    }
    updateStatistics(round);
}

const updateStatistics = (round) => {
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
    round.tenCountElement.textContent = tenCount;
    round.xCountElement.textContent = xCount;
};

const moveFocus = (direction) => {
    const newIndex = focusIndex + direction;

    if (newIndex >= 0 && newIndex < rounds[0].inputs.length) {
        focus(rounds[0].inputs[newIndex]);
        unfocus(rounds[0].inputs[focusIndex]);
        focusIndex = newIndex;
    }
};

function focus(elem) {
    elem.classList.add("inner-outline");
    elem.scrollIntoView({behavior: "smooth", block: "start"});
}

function unfocus(elem) {
    elem.classList.remove("inner-outline");
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
        calculateScore(rounds[0]);
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

function buttonPressed(e) {
    e.preventDefault();
    const value = e.target.dataset.value;

    if (value === "del") {
        backSpace();
    } else {
        setCellValue(rounds[0].inputs[focusIndex], value);
        moveFocus(1);
    }
    saveToURL();
    setTimeout(calculateScore, 50);
}

function saveToURL() {
    const score = rounds.map(e => e.inputs.map(input => input.textContent.trim()).join('')).join(',');
    const date = rounds.map(e => e.date.innerText).join(',');
    const distance = rounds.map(e => e.distance.innerText).join(',');
    history.replaceState("", "", `?date=${date}&distance=${distance}&score=${score}`);
}

function setCellValue(inputElem, value) {
    inputElem.classList.remove(getColorClassName(inputElem.innerText))
    inputElem.innerHTML = value;
    inputElem.classList.add(getColorClassName(value))
}

function backSpace() {
    setCellValue(inputs[focusIndex], "&nbsp;");
    moveFocus(-1);
    setCellValue(inputs[focusIndex], "&nbsp;");
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

const handleInputClick = (e) => {
    e.preventDefault();
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] === e.target || inputs[i].innerText.trim() === "") {
            if (i !== focusIndex) {
                unfocus(inputs[focusIndex]);
                focusIndex = i;
                focus(inputs[focusIndex]);
            }
            break;
        }
    }
};


function Round(round) {
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

    // Add event listeners to input elements
    this.inputs = Array.from(round.getElementsByClassName("shot"));
    this.inputs.forEach(input => {
        input.addEventListener("click", handleInputClick);
    });


    this.tenCountElement = round.getElementsByClassName("ten-count").item(0);
    this.xCountElement = round.getElementsByClassName("x-count").item(0);
    this.date = round.getElementsByClassName("date").item(0);
    this.datePicker = round.getElementsByClassName("date-picker")[0];
    this.dateDisplay = document.getElementsByClassName('date')[0];
    this.dateDisplay.addEventListener('click', () => {
        this.datePicker.focus();
        this.datePicker.click();
    });

    this.datePicker.addEventListener('change', () => {
        const selectedDate = new Date(this.datePicker.value);
        this.dateDisplay.textContent = formatDate(selectedDate);
        saveToURL();
        this.datePicker.click();
    });

    this.distance = round.getElementsByClassName('distance')[0];
    this.distance.addEventListener('click', (event) => {
        distanceToBeSet = event.target;
        distanceMenu.style.display = (distanceMenu.style.display === 'block') ? 'none' : 'block';
        distanceMenu.style.left = `${event.pageX}px`;
        distanceMenu.style.top = `${event.pageY}px`;
    });


}

let rounds = [new Round(document.getElementsByClassName("round").item(0))];

function restore() {
    const searchParams = new URLSearchParams(window.location.search);
    // restore state from URL
    let index = 0;
    if (searchParams.has("score")) {
        const scoreString = searchParams.get("score");
        scoreString.split('').forEach(fillScore => {
            if (fillScore !== "0") {
                setCellValue(rounds[0].inputs[index], fillScore);
                index++;
            } else {
                setCellValue(rounds[0].inputs[index - 1], "10");
            }
        });
        focusIndex = ((index) === rounds[0].inputs.length) ? index - 1 : index;
        focus(rounds[0].inputs[focusIndex]);
    } else {
        focus(rounds[0].inputs[0]);
    }
    let date;
    if (searchParams.has("date")) {
        date = searchParams.get("date");
    } else {
        date = formatDate(new Date());
    }
    rounds[0].date.innerText = date;
    rounds[0].datePicker.value = date;

    if (searchParams.has("distance")) {
        rounds[0].distance.innerText = searchParams.get("distance");
    } else {
        rounds[0].distance.innerText = "70m";
    }
    calculateScore(rounds[0]);

}

restore();

function clearScore() {
    if (confirm("スコアを消去して良いですか?")) {
        rounds[0].inputs.forEach(input => setCellValue(input, "&nbsp;"));
        unfocus(rounds[0].inputs[focusIndex]);
        focusIndex = 0;
        focus(rounds[0].inputs[focusIndex]);
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
        // add new scorecard
    } else {
        distanceToBeSet.innerText = elem.innerText;
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

