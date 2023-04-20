const scoreTable = document.getElementById("score-table");
const hitCountElement = document.getElementById("hit-count");
const tenCountElement = document.getElementById("ten-count");
const xCountElement = document.getElementById("x-count");
let scoreIndex = 0;

const calculateScore = () => {
    let runningTotal = 0;
    for (let i = 0; i < 6; i++) {
        const endIndex = i * 2;
        const startIndex = i * 6;

        let firstThree = inputs.slice(startIndex, startIndex + 3);
        const sum1 = sumThree(firstThree);
        let laterThree = inputs.slice(startIndex + 3, startIndex + 6);
        const sum2 = sumThree(laterThree);
        const sum1Filled = isFilled(firstThree)
        const sum2Filled = isFilled(laterThree)
        const total = sum1 + sum2;

        scoreTable.rows[endIndex].cells[4].textContent = sum1Filled ? sum1 : ""; // 1-3 sum
        scoreTable.rows[endIndex + 1].cells[3].textContent = sum2Filled ? sum2 : ""; // 4-6 sum
        runningTotal += total;
        scoreTable.rows[endIndex].cells[5].textContent = sum1Filled || sum2Filled ? total : ""; // 6本計
        const endOver50 = total >= 50;
        if (endOver50) {
            scoreTable.rows[endIndex].cells[5].classList.add("over50");
        } else {
            scoreTable.rows[endIndex].cells[5].classList.remove("over50");
        }
        scoreTable.rows[endIndex].cells[6].textContent = i !== 0 && (sum1Filled || sum2Filled) ? runningTotal : "";
        const totalOver50 = runningTotal >= 50 * (i + 1);
        if (totalOver50) {
            scoreTable.rows[endIndex].cells[6].classList.add("over50");
        } else {
            scoreTable.rows[endIndex].cells[6].classList.remove("over50");
        }
    }
    updateStatistics();
};

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


const updateStatistics = () => {
    let hitCount = 0;
    let xCount = 0;
    let tenCount = 0;

    inputs.forEach((input) => {
        const value = input.innerText;
        if (value === "X" || (0 < value && value <= 10)) {
            hitCount++;
        }
        if (value === "X") {
            xCount++;
            tenCount++;
        }
        if (value === "10") {
            tenCount++;
        }
    });

    hitCountElement.textContent = hitCount;
    tenCountElement.textContent = tenCount;
    xCountElement.textContent = xCount;
};


const moveFocus = (direction) => {
    const newIndex = focusIndex + direction;

    if (newIndex >= 0 && newIndex < inputs.length) {
        focus(inputs[newIndex]);
        unfocus(inputs[focusIndex]);
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
let flickThreshold = 30; // ここでフリックの幅を設定します（ピクセル単位）
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
    if (-1 <= numberOfFlicks&&  numberOfFlicks < flickCounter && flickMinIndex < focusIndex) {
        backSpace();
        calculateScore();
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
        setCellValue(inputs[focusIndex], value);
        moveFocus(1);
    }
    saveToURL();
    setTimeout(calculateScore, 50);
}
function saveToURL(){
    const score = inputs.map(input => input.textContent.trim()).join('');
    const date = document.getElementsByClassName("date")[scoreIndex].innerText;
    const distance = document.getElementsByClassName("distance")[scoreIndex].innerText;
    history.replaceState("", "", `?date=${date}&distance=${distance}&score=${score}`);
}
function setCellValue(inputElem, value){
    inputElem.classList.remove(getColorClassName(inputElem.innerText))
    inputElem.innerHTML = value;
    inputElem.classList.add(getColorClassName(value))
}
function backSpace(){
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
let inputs;
let focusIndex = 0;
const initScoreTable = () => {

    for (let i = 1; i <= 6; i++) {
        scoreTable.insertRow()
            .innerHTML = `
                <td rowspan="2">${i}</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
                <td rowspan="2"></td>
                <td rowspan="2"></td>
            `;
        scoreTable.insertRow()
            .innerHTML = `
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
            `;
    }

    // Add event listeners to input elements
    inputs = Array.from(scoreTable.querySelectorAll(".shot"));
    inputs.forEach(input => {
        input.addEventListener("click", handleInputClick);
    });

    const searchParams = new URLSearchParams(window.location.search);
    // restore state from URL
    let index = 0;
    if (searchParams.has("score")) {
        const scoreString = searchParams.get("score");
        scoreString.split('').forEach(fillScore => {
            if (fillScore !== "0") {
                setCellValue(inputs[index], fillScore);
                index++;
            } else {
                setCellValue(inputs[index - 1], "10");
            }
        });
        calculateScore();
        focusIndex = ((index) === inputs.length) ? index - 1 : index;
        focus(inputs[focusIndex]);
    }else{
        focus(inputs[0]);
    }
    let date;
    if(searchParams.has("date")){
        date =  searchParams.get("date");
    }else{
        date = formatDate(new Date());
    }
    document.getElementsByClassName("date")[scoreIndex].innerText= date;
    document.getElementsByClassName("date-picker")[scoreIndex].value= date;

    if(searchParams.has("distance")){
        document.getElementsByClassName("distance")[scoreIndex].innerText= searchParams.get("distance");
    }else{
        document.getElementsByClassName("distance")[scoreIndex].innerText= "70m";
    }
};

initScoreTable();
function clearScore(){
    if (confirm("スコアを消去して良いですか?")) {
        inputs.forEach(input => setCellValue(input, "&nbsp;"));
        unfocus(inputs[focusIndex]);
        focusIndex = 0;
        focus(inputs[focusIndex]);
        removeThumbnail();
        calculateScore();
        saveToURL();

    }
}
document.getElementById("clear-button").addEventListener("click", clearScore);
const scoreElement = document.getElementById("scores");

function removeThumbnail(){
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


// dot menu
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
});

// distance menu
const distance = document.getElementById('distance');
const distanceMenu = document.getElementById('distance-menu');

distance.addEventListener('click', (event) => {
    distanceMenu.style.display = (distanceMenu.style.display === 'block') ? 'none' : 'block';

    const menuWidth = distanceMenu.offsetWidth;
    const menuHeight = distanceMenu.offsetHeight;
    distanceMenu.style.left = `${event.pageX}px`;
    distanceMenu.style.top = `${event.pageY}px`;
});

document.addEventListener('click', (event) => {
    if (event.target !== distance && event.target !== distanceMenu) {
        distanceMenu.style.display = 'none';
    }
});

Array.from(document.getElementsByClassName("distance-menu-choice")).forEach(
    elem=>elem.addEventListener('click',(event)=>{
        distance.innerText = elem.innerText;
        distanceMenu.style.display = 'none';
        saveToURL();
    })
)

function formatDate(date){

    const locale = navigator.language;

    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    return formatter.format(date);
}

const dateDisplays = document.getElementsByClassName('date');
const datePickers = document.getElementsByClassName('date-picker');


for (let i = 0; i < dateDisplays.length; i++) {
    const dateDisplay = dateDisplays[i];
    const datePicker = datePickers[i];
    dateDisplay.addEventListener('click', () => {
        datePicker.focus();
        datePicker.click();

    });
    datePicker.addEventListener('change', () => {
        const selectedDate = new Date(datePicker.value);
        dateDisplay.textContent = formatDate(selectedDate);
        saveToURL();
        datePicker.click();
    });
}
