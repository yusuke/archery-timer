const scoreValue = (input) => {
    const value = input.textContent.toUpperCase();
    if (value === "X") return 10;
    if (value === "M") return 0;
    const intValue = parseInt(value);
    if (isNaN(intValue) || intValue < 0 || intValue > 10) return null;
    return intValue;
};

const calculateScore = () => {
    const scoreTable = document.getElementById("score-table");
    let totalScore = 0;
    for (let i = 0; i < 6; i++) {
        const endIndex = i * 2;
        const inputs1 = scoreTable.rows[endIndex].querySelectorAll(".shot");
        const inputs2 = scoreTable.rows[endIndex + 1].querySelectorAll(".shot");

        const sum1 = Array.from(inputs1).reduce((acc, input) => acc + (scoreValue(input) || 0), 0);
        const sum2 = Array.from(inputs2).reduce((acc, input) => acc + (scoreValue(input) || 0), 0);
        const total = sum1 + sum2;

        scoreTable.rows[endIndex].cells[4].textContent = sum1 || "0"; // 1本目〜3本目の計
        scoreTable.rows[endIndex + 1].cells[3].textContent = sum2 || "0"; // 4本目〜6本目の計
        totalScore += total;

        scoreTable.rows[endIndex].cells[5].textContent = total; // 6本計
        scoreTable.rows[endIndex].cells[6].textContent = totalScore;
    }
    updateStatistics();
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
        } else if (value === "10") {
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

const keyboard = document.getElementById("keyboard");

const onScreenKeyboardBtns = keyboard.querySelectorAll("td");

onScreenKeyboardBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        const value = this.dataset.value;

        if (value === "⌫") {
            inputs[focusIndex].classList.remove(getColorClassName(inputs[focusIndex].innerText))
            inputs[focusIndex].innerText = "";
            moveFocus(-1);
        }else {
            inputs[focusIndex].classList.remove(getColorClassName(inputs[focusIndex].innerText))
            inputs[focusIndex].innerText = value;
            inputs[focusIndex].classList.add(getColorClassName(value))

            moveFocus(1);
        }
        setTimeout(calculateScore, 50);
    });
});
function getColorClassName(value){
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

document.body.appendChild(keyboard);

const handleInputClick = (e) => {
    e.preventDefault();
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] === e.target) {
            unfocus(inputs[focusIndex]);
            focusIndex = i;
            focus(inputs[focusIndex]);
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
