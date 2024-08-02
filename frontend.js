
let a = document.getElementById('a');
let b = document.getElementById('b');
let result = document.getElementById('result');

const checkboxes = ['mnSwitch', 'numberCheck', 'kitzurCheck', 'rasheiTeivot'];
const toggleAllCheckbox = document.getElementById('toggleAll');

checkboxes.forEach(value => {
        const checkbox = document.getElementById(`checkbox${value}`);
        checkbox.addEventListener('change', changed);
    });

toggleAllCheckbox.addEventListener('change', toggleAll);


function changed() {


    const options = {};

    checkboxes.forEach(value => {
        const checkbox = document.getElementById(`checkbox${value}`);
        options[value] = checkbox.checked;
    });

	let diff = process(Diff["diffWords"](b.textContent, a.textContent, {oneChangePerToken: true}), options);
	let fragment = document.createDocumentFragment();
    console.log(diff);
	for (let i=0; i < diff.length; i++) {
        let mask = (ele, word) => {
            if (ele && word && word.mask) { 
                ele.classList.add("mask");
            } 
            return ele;
        }
		let node;
		if (diff[i].removed) {
			node = mask(document.createElement('del'), diff[i]);
			node.appendChild(document.createTextNode(diff[i].value.trim() + " "));
		} else if (diff[i].added) {
			node = mask(document.createElement('ins'), diff[i]);
			node.appendChild(document.createTextNode("● "));
		} else {
            //if we have extra words in the first selection
            if(diff[i].value != "\n" && diff[i].value.trim() != "") {
    			node = mask(document.createElement("span"), diff[i]);
                node.appendChild(document.createTextNode(diff[i].value.trim() + " "));
            }
		}
		if(node) fragment.appendChild(node);
	}

	result.textContent = '';
	result.appendChild(fragment);
}

function toggleAll() {
    const isChecked = this.checked;

    checkboxes.forEach(value => {
        const checkbox = document.getElementById(`checkbox${value}`);
        checkbox.checked = isChecked;
    });
    
    changed();
}

window.onload = function() {
	changed();
};

a.onpaste = a.onchange = b.onpaste = b.onchange = changed;

if ('oninput' in a) {
	a.oninput = b.oninput = changed;
} else {
	a.onkeyup = b.onkeyup = changed;
}