export default function LottoNumbers(root) {
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'number-selection';

    // for (let i = 0; i < 6; i++) {
    //     const numberInput = document.createElement('input');
    //     numberInput.type = 'number';
    //     numberInput.className = 'bet-input';
    //     numberInput.maxLength = 2;
    //     numberInput.min = 1;
    //     numberInput.max = 49;
    //     numbersContainer.appendChild(numberInput);
    // }

    root.appendChild(numbersContainer);

    const inputs = numbersContainer.querySelectorAll(".bet-input");

    inputs.forEach(input => {
        input.addEventListener("input", function () {
            let value = this.value.trim();

            if (!/^\d{1,2}$/.test(value) || value < 1 || value > 49) {
                this.value = "";
                return;
            }

            let values = Array.from(inputs).map(inp => inp.value).filter(v => v !== "");
            let uniqueValues = new Set(values);

            if (uniqueValues.size !== values.length) {
                this.value = "";
            }
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") return;
            if (!/^\d$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                e.preventDefault();
            }
        });
    });
}
