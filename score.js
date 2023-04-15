const scoreValue = (input) => {
    const value = input.textContent.toUpperCase();
    if (value === "X") return 10;
    if (value === "M") return 0;
    const intValue = parseInt(value);
    if (isNaN(intValue) || intValue < 0 || intValue > 10) return 0;
    return intValue;
};

const calculateScore = () => {
    const scoreTable = document.getElementById("score-table");
    let totalScore = 0;
    for (let i = 0; i < 6; i++) {
        const endIndex = i * 2;
        const startIndex = i*6;


        let firstThree = inputs.slice(startIndex, startIndex + 3);
        const sum1 = sumThree(firstThree);
        let laterThree = inputs.slice(startIndex + 3, startIndex + 6);
        const sum2 = sumThree(laterThree);
        const sum1Filled = isFilled(firstThree)
        const sum2Filled = isFilled(laterThree)
        const total = sum1 + sum2;

        scoreTable.rows[endIndex].cells[4].textContent = sum1Filled ? sum1 : ""; // 1-3 sum
        scoreTable.rows[endIndex + 1].cells[3].textContent = sum2Filled ? sum2 : ""; // 4-6 sum
        totalScore += total;
        scoreTable.rows[endIndex].cells[5].textContent = sum1Filled || sum2Filled ? total : ""; // 6本計
        scoreTable.rows[endIndex].cells[6].textContent = i !== 0 && (sum1Filled || sum2Filled) ? totalScore : "";

    }
    updateStatistics();
};
function sumThree(elems){
    return scoreValue(elems[0]) + scoreValue(elems[1]) + scoreValue(elems[2])
}
function isFilled(elems){
    return (elems[0].textContent + elems[1].textContent + elems[2].textContent).trim() !== "";
}

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

    // 集計結果を表示する要素を追加する
    const hitCountElement = document.getElementById("hit-count");
    const tenCountElement = document.getElementById("ten-count");
    const xCountElement = document.getElementById("x-count");

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
}

function unfocus(elem) {
    elem.classList.remove("inner-outline");

}


const onScreenKeyboardBtns = keyboard.querySelectorAll("td");

onScreenKeyboardBtns.forEach(btn => {
    if (btn.dataset.value) {

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const value = this.dataset.value;

            if (value === "⌫") {
                inputs[focusIndex].classList.remove(getColorClassName(inputs[focusIndex].innerText))
                inputs[focusIndex].innerHTML = "&nbsp;";
                moveFocus(-1);
            } else {
                inputs[focusIndex].classList.remove(getColorClassName(inputs[focusIndex].innerText))
                inputs[focusIndex].innerText = value;
                inputs[focusIndex].classList.add(getColorClassName(value))

                moveFocus(1);
            }
            setTimeout(calculateScore, 50);
        });
        }

});

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
    const scoreTable = document.getElementById("score-table");

    for (let i = 0; i < 12; i++) {
        const row = scoreTable.insertRow();
        if (i % 2 === 0) {
            row.innerHTML = `
                <td rowspan="2">${(i / 2) + 1}</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
                <td rowspan="2"></td>
                <td rowspan="2"></td>
            `;
        } else {
            row.innerHTML = `
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td class="shot">&nbsp;</td>
                <td></td>
            `;
        }
    }

    // Add event listeners to input elements
    inputs = Array.from(document.getElementById("score-table").querySelectorAll(".shot"));
    inputs.forEach(input => {
        input.addEventListener("click", handleInputClick);
    });
    focus(inputs[0]);

};

initScoreTable();
const adjustScoreWrapperHeight = () => {
    const keyboard = document.getElementById('keyboard');
    const scoreWrapper = document.querySelector('.score-wrapper');
    const keyboardHeight = keyboard.offsetHeight;

    scoreWrapper.style.maxHeight = `calc(100vh - ${keyboardHeight + 50}px)`;
};

adjustScoreWrapperHeight();
