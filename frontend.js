// frame code from @kpdecker
document.addEventListener('DOMContentLoaded', () => {
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const result = document.getElementById('result');

    const checkboxes = ['ignoreMnSwitch', 'ignoreNumberGematria', 'ignoreKitzurim', 'ignoreRasheiTeivot', 'ignoreMaleiChaser'];
    const toggleAllCheckbox = document.getElementById('toggleAll');

    
    const checkboxElements = checkboxes.reduce((acc, value) => {
        acc[value] = document.getElementById(`${value}`);
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
        result.textContent = '';

        const oldText = a.textContent;
        const newText = b.textContent;
        

        const diff = Synopsis.process(oldText, newText, options);
        const fragment = document.createDocumentFragment();
        for(const word of diff) {
            node = (word.highlighted) ? document.createElement('del') : document.createElement('span');
            node.textContent = `${word.text}`;
            fragment.appendChild(node);
            const space = document.createElement('span');
            space.textContent = " ";
            fragment.appendChild(space);
            result.appendChild(fragment);
        }
    }

    
    const inputElements = [a, b];
    inputElements.forEach(input => {
        input.addEventListener('paste', handleCheckboxChange);
        input.addEventListener('change', handleCheckboxChange);
        input.addEventListener('input', handleCheckboxChange);
    });

    
    handleCheckboxChange();
});
