document.addEventListener('DOMContentLoaded', () => {
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const result = document.getElementById('result');

    const checkboxes = ['mnSwitch', 'numberCheck', 'kitzurCheck', 'rasheiTeivot'];
    const toggleAllCheckbox = document.getElementById('toggleAll');

    
    const checkboxElements = checkboxes.reduce((acc, value) => {
        acc[value] = document.getElementById(`checkbox${value}`);
        return acc;
    }, {});

    
    Object.values(checkboxElements).forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    toggleAllCheckbox.addEventListener('change', handleToggleAll);

    
    function handleCheckboxChange() {
        const options = checkboxes.reduce((acc, value) => {
            acc[value] = checkboxElements[value].checked;
            return acc;
        }, {});

        updateResult(options);
    }

    
    function handleToggleAll() {
        const isChecked = this.checked;

        Object.values(checkboxElements).forEach(checkbox => {
            checkbox.checked = isChecked;
        });

        handleCheckboxChange();
    }

    
    function updateResult(options) {
        const diff = Synopsis.process(Diff.diffWords(b.textContent, a.textContent, { oneChangePerToken: true }), options);
        const fragment = document.createDocumentFragment();

        diff.forEach(item => {
            let node;
            if (item.removed) {
                node = createMaskedElement('del', item);
                node.textContent = `${item.value.trim()} `;
            } else if (item.added) {
                node = createMaskedElement('ins', item);
                node.textContent = '● ';
            } else if (item.value.trim() !== "" && item.value !== "\n") {
                node = createMaskedElement('span', item);
                node.textContent = `${item.value.trim()} `;
            }

            if (node) fragment.appendChild(node);
        });

        result.textContent = '';
        result.appendChild(fragment);
    }

    
    function createMaskedElement(tag, item) {
        const ele = document.createElement(tag);
        if (item.mask) {
            ele.classList.add('mask');
        }
        return ele;
    }

    
    const inputElements = [a, b];
    inputElements.forEach(input => {
        input.addEventListener('paste', handleCheckboxChange);
        input.addEventListener('change', handleCheckboxChange);
        input.addEventListener('input', handleCheckboxChange);
    });

    
    handleCheckboxChange();
});
