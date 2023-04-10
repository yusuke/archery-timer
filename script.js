const handleBackspace = (e) => {
    const input = e.target;
    if (e.key === "Backspace") {
        if (input.value) {
            input.value = "";
        } else {
            const inputs = Array.from(document.querySelectorAll("input"));
            const currentIndex = inputs.indexOf(input);
            if (currentIndex > 0) {
                inputs[currentIndex - 1].focus();
                inputs[currentIndex - 1].value = "";
                inputs[currentIndex - 1].select();
            }
        }
        e.preventDefault(); // ブラウザのデフォルトのバックスペース動作をキャンセル
        e.stopPropagation(); // イベントの伝播を止める
        calculateScore();
    }
};

const moveToNextInput = (e) => {
    const input = e.target;
    const value = input.value.toUpperCase();
    if ((/^[XxMm0-9]*$/.test(value) && value !== "1") || value === "10") {
        const inputs = Array.from(document.querySelectorAll("input"));
        const currentIndex = inputs.indexOf(input);
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        }
    }
};

const restrictInput = (e) => {
    if (!/^[XxMm0-9]*$/.test(e.key)) {
        e.preventDefault();
    }
};

const scoreValue = (input) => {
    const value = input.value.toUpperCase();
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
        const inputs1 = scoreTable.rows[endIndex].querySelectorAll("input");
        const inputs2 = scoreTable.rows[endIndex + 1].querySelectorAll("input");

        const sum1 = Array.from(inputs1).reduce((acc, input) => acc + (scoreValue(input) || 0), 0);
        const sum2 = Array.from(inputs2).reduce((acc, input) => acc + (scoreValue(input) || 0), 0);
        const total = sum1 + sum2;

        scoreTable.rows[endIndex].cells[4].textContent = sum1 || "0"; // 1本目〜3本目の計
        scoreTable.rows[endIndex + 1].cells[3].textContent = sum2 || "0"; // 4本目〜6本目の計
        totalScore += total;

            scoreTable.rows[endIndex].cells[5].textContent = total; // 6本計
                scoreTable.rows[endIndex].cells[6].textContent = totalScore;


        scoreTable.rows[endIndex + 1].cells[3].style.visibility = (inputs1.length === 1) ? "hidden" : "visible";
    }
};

window.onload = () => {
    const scoreTable = document.getElementById("score-table");

    for (let i = 1; i <= 6; i++) {
        const row1 = document.createElement("tr");
        row1.innerHTML = `
      <td rowspan="2">${i}</td>
      <td><input type="text" maxlength="2" size="2"></td>
      <td><input type="text" maxlength="2" size="2"></td>
      <td><input type="text" maxlength="2" size="2"></td>
      <td class="col3"></td>
      <td rowspan="2" class="col3"></td>
      <td rowspan="2" class="col3"></td>
    `;
        scoreTable.appendChild(row1);

        const row2 = document.createElement("tr");
        row2.innerHTML = `
      <td><input type="text" maxlength="2" size="2"></td>
        <td><input type="text" maxlength="2" size="2"></td>
      <td><input type="text" maxlength="2" size="2"></td>
      <td class="col3"></td>
    `;
        scoreTable.appendChild(row2);
    }

    const inputs = scoreTable.querySelectorAll("input");
    inputs.forEach((input) => {
        input.addEventListener("keydown", restrictInput);
        input.addEventListener("keyup", moveToNextInput);
        input.addEventListener("keyup", handleBackspace);
        input.addEventListener("input", calculateScore);
    });
};
