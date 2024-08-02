const Synopsis = (() => {
    const hebrewNumberLetters = {
        'אחד': 'א', 'אחת': 'א',
        'שניים': 'ב', 'שנים': 'ב', 'שתיים': 'ב', 'שתים': 'ב', 'שתי': 'ב', 'שני': 'ב',
        'שלושה': 'ג', 'שלשה': 'ג', 'שלוש': 'ג', 'שלש': 'ג',
        'ארבעה': 'ד', 'ארבע': 'ד',
        'חמישה': 'ה', 'חמשה': 'ה', 'חמש': 'ה',
        'שישה': 'ו', 'ששה': 'ו', 'שש': 'ו',
        'שבעה': 'ז', 'שבע': 'ז',
        'שמונה': 'ח',
        'תשעה': 'ט', 'תשע': 'ט',
        'עשרה': 'י', 'עשר': 'י',
        'ראשון': 'א', 'ראשונה': 'א',
        'שני': 'ב', 'שנית': 'ב',
        'שלישי': 'ג', 'שלישית': 'ג',
        'רביעי': 'ד', 'רביעית': 'ד',
        'חמישי': 'ה', 'חמישית': 'ה',
        'שישי': 'ו', 'שישית': 'ו',
        'שביעי': 'ז', 'שביעית': 'ז',
        'שמיני': 'ח', 'שמינית': 'ח',
        'תשיעי': 'ט', 'תשיעית': 'ט',
        'עשירי': 'י', 'עשירית': 'י',
        'עשרים': 'כ',
        'שלושים': 'ל',
        'ארבעים': 'מ',
        'חמישים': 'נ',
        'שישים': 'ס',
        'שבעים': 'ע',
        'שמונים': 'פ',
        'תשעים': 'צ',
        'מאה': 'ק'
    };

    const numberShorts = Object.keys(hebrewNumberLetters).join("|");

    const filters = {
        mnSwitch: (a, b) => {
            if (!a || !b) return false;
            return a.endsWith("ן") && b.endsWith("ם") && a.slice(0, -1) === b.slice(0, -1);
        },
        numberCheck: (a, b) => {
            if (!a || !b) return false;
            if (a.endsWith("'") && a.length <= 4) {
                const shortNumber = b.match(new RegExp(numberShorts));
                if (shortNumber) {
                    return a.match(new RegExp(hebrewNumberLetters[shortNumber]));
                }
            }
            return false;
        },
        kitzurCheck: (a, b, otherWords, index) => {
            if (!a) return false;
            const baseWord = a.trim().slice(0, -1);
            if (a.endsWith("'")) {
                for (let j = Math.max(index - 2, 0); j <= Math.min(index + 2, otherWords.length - 1); j++) {
                    if (j === index) continue;
                    const otherWordValue = otherWords[j].value.trim();
                    if (otherWordValue.includes(baseWord) && otherWordValue !== baseWord) {
                        return true;
                    }
                }
            } else {
                for (let j = Math.max(index - 2, 0); j <= Math.min(index + 2, otherWords.length - 1); j++) {
                    if (j === index) continue;
                    const otherWordValue = otherWords[j].value.trim();
                    if (otherWordValue.endsWith("'")) {
                        if (baseWord.includes(otherWordValue.slice(0, -1))) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        rasheiTeivot: (a, b, otherWords, index) => {
            if (!a) return false;
            if (a.includes("\"")) {
                const lettersInRT = a.split("");
                let isValid = true;
                lettersInRT.forEach((letter, i) => {
                    if (letter !== otherWords[i].charAt(0)) {
                        isValid = false;
                    }
                });
                return isValid;
            }
            return false;
        }
    };

    const process = (changeObj, options) => {
        // 1. Remove blank space
        changeObj = changeObj.filter((token, i) => i === changeObj.length - 1 || token.value.trim() !== "");

        // 2. Apply filters
        changeObj.forEach((token, k) => {
            Object.entries(options).forEach(([key, value]) => {
                if (value) {
                    const a = token.value.trim();
                    const b = changeObj[k + 1]?.value.trim();
                    if (filters[key](a, b, changeObj, k) || filters[key](b, a, changeObj, k)) {
                        changeObj[k].mask = true;
                    }
                }
            });
        });

        // 3. Remove notations on tokens from base text
        for (let j = changeObj.length - 1; j > 0; j--) {
            const prev = changeObj[j - 1];
            const curr = changeObj[j];
            if (curr.added && prev && !prev.added && !curr.flip) {
                if (changeObj[j + 1]?.added && !changeObj[j + 1].flip) {
                    // If the next token is added and not flipped, flip and move current token
                    [changeObj[j - 1], changeObj[j]] = [changeObj[j], prev];
                    changeObj[j - 1].flip = true;
                    changeObj.splice(j + 1, 1);
                } else {
                    // Otherwise, remove the current token
                    changeObj.splice(j, 1);
                }
            }
        }

        return changeObj;
    };

    return {
        process: process
    };
})();