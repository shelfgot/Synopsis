const Synopsis = (() => {
    // hardcorded for now
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
    const shortNumRE = new RegExp(numberShorts);

    /*
    Class definitions
    */

    class Letter {
        constructor(token, type) {
            this.token = token;
            this.type = type;
            this.ignore = false;
        }

        ignoreDiff() {
            this.ignore = true;
        }
    
        getText() {
            return this.token;
        }
    }
    
    class Syllable {
        constructor(letters, type) {
            this.letters = letters; 
            this.type = type; 
        }

        ignore() {
            this.letters.forEach((letter) => letter.ignoreDiff());
        }
    
        getText() {
            return this.letters.map(letter => letter.getText()).join('');
        }
    }
    
    class Word {
        constructor(syllables) {
            this.syllables = syllables; 
            this.syllableTypes = syllables.map(syllable => syllable.type); 
        }

        ignore() {
            this.syllables.forEach((syllable) => syllable.ignore());
        }
    
        getText() {
            return this.syllables.map(syllable => syllable.getText()).join('');
        }
        getAllLetters() {
            return this.syllables
                .flatMap(syllable => syllable.letters); 
        }

        hasNonIgnoredAddedLetter() {
            return this.getAllLetters().some(letter => 
                letter.type === 'added' && !letter.ignore
            );
        }
        fullyRemoved() {
            return this.getAllLetters().every(letter => letter.type === 'removed');
        }        
    }
    
    class Paragraph {
        constructor(words) {
            this.words = words; 
        }
    
        getText() {
            return this.words.map(word => word.getText()).join(' ');
        }

        getAllWords() {
            return this.words;
        }

        package() {
            return this.words.map((word) => {
                let lemma, highlighted;
                if (word.fullyRemoved()) {
                    console.log('fully removed');
                    lemma = '●';
                    highlighted = true;
                }
                else {
                    lemma = word.getAllLetters().filter(item => item.type !== 'removed').map(ele => ele.token).join("");
                    highlighted = word.hasNonIgnoredAddedLetter();
                }
                let text = {'text': lemma, 'highlighted': highlighted};
                return text;
            })
        }
    }
    
    /*
    Helper functions
    */
    const createParagraphFromDiffObj = (DiffObj) => {
        const splitIntoSyllables = (letters) => {
            return letters.reduce((syllables, letter) => {
                const lastSyllable = syllables[syllables.length - 1];
    
                if (!lastSyllable || lastSyllable.type !== letter.type) {
                    // Create a new syllable
                    syllables.push(new Syllable([letter], letter.type));
                } else {
                    // Add letter to the current syllable
                    lastSyllable.letters.push(letter);
                }
    
                return syllables;
            }, []);
        };
    
        const words = DiffObj
            .reduce((chunks, { token, type }) => {
                if (token === ' ' && type === 'unchanged') {
                    // Create a new word chunk
                    chunks.push([]);
                } else {
                    // Add letter to the last word chunk
                    const letter = new Letter(token, type);
                    chunks[chunks.length - 1].push(letter);
                }
                return chunks;
            }, [[]]) // Start with an empty word chunk
            .filter(chunk => chunk.length > 0) // Remove empty chunks
            .flatMap((chunk) => {
                // Split letters into syllables
                const sylls = splitIntoSyllables(chunk);
    
                // Create words based on syllables
                let words = [];
                let currentWord = [];
                for (let i = 0; i < sylls.length; i++) {
                    const syllable = sylls[i];
    
                    // Check for a space BEFORE the current syllable
                    const isSpaceBefore =
                        currentWord.length === 0;
    
                    // Check for a space AFTER the current syllable
                    const isSpaceAfter =
                        syllable.letters[syllable.letters.length - 1]?.token === ' ';
    
                    if (
                        syllable.type === 'removed' &&
                        isSpaceBefore &&
                        isSpaceAfter
                    ) {
                        // Treat the syllable as a separate word
                        if (currentWord.length > 0) {
                            words.push(new Word(currentWord));
                            currentWord = [];
                        }
                        words.push(new Word([syllable]));
                    } else {
                        // Add syllable to the current word
                        currentWord.push(syllable);
                    }
                }
                if (currentWord.length > 0) {
                    words.push(new Word(currentWord));
                }
                return words;
            });
        console.log(words);
        return new Paragraph(words);
    };
    

    /*
    Filtering functions
    */

    const ignoreFilters = {
        // desperately needs to be refactored
        ignoreNumberGematria: (word) => {
            let l = word.syllables.length;
            let ultima = word.syllables[l-1];
            let penult = word.syllables[l-2];
            let u_t = ultima?.getText(), p_t = penult?.getText(), u_match = u_t?.match(shortNumRE), p_match = p_t?.match(shortNumRE);
            if(
                ultima && penult
                &&  (
                        ( u_t.endsWith(`'`) && p_match && u_t.match( new RegExp(hebrewNumberLetters[p_match]) ) ) 
                        ||
                        ( p_t.endsWith(`'`) && u_match && p_t.match( new RegExp(hebrewNumberLetters[u_match]) ) ) 
                )
            ) {
                ultima.ignore();
                penult.ignore();
            };
            
        },
        ignoreMnSwitch: (word) => {
            let l = word.syllables.length;
            let ultima = word.syllables[l-1];
            let penult = word.syllables[l-2];
            if(
                ultima && penult
                &&  ((ultima.getText() == 'ם' && penult.getText() == 'ן') || (ultima.getText() == 'ן' && penult.getText() == 'ם'))
            ) {
                ultima.ignore();
                penult.ignore();
            };
        },

        ignoreKitzurim: (word) => {
            let l = word.syllables.length;
            let ultima = word.syllables[l-1];
            let penult = word.syllables[l-2];
            if(
                ultima && penult
                &&  (ultima.getText() ==  `'` || penult.getText() == `'`)
            ) {
                ultima.ignore();
                penult.ignore();
            };
        },

        ignoreRasheiTeivot: (word) => {
            // if space, then RT was added
            if (word.getText().includes(` `)) {
                word.ignore();
            }
        },

        ignoreMaleiChaser: (word) => {
            const syls = word.syllables;
            for (const [index, syl] of syls.entries()) {
                if (
                    syls[index-1]?.type == 'unchanged' && syls[index+1]?.type == 'unchanged' && (syl.type == 'added' || syl.type == 'removed')
                ) {
                    syl.ignore();
                }
            }
        }
    };

    /*
    Main process
    */


    const process = (old_text, new_text, options) => {

        const test = [
            { token: "H", type: "unchanged" },
            { token: "e", type: "added" },
            { token: "l", type: "added" },
            { token: " ", type: "unchanged" },
            { token: "l", type: "removed" },
            { token: "o", type: "removed" },
            { token: " ", type: "removed" },
            { token: "!", type: "added" }
        ];
        const paragraph = createParagraphFromDiffObj(test);
    
        paragraph.getAllWords().forEach((word, index) => {
        console.log(`Word ${index + 1}:`, word.getText());
        console.log(`Syllable types:`, word.syllables.map(s => s.type));
        });

        let [old_tokens, new_tokens] = [old_text.trim().split(""), new_text.trim().split("")];
        let Diff = myersDiff(old_tokens, new_tokens);
        let Selection = createParagraphFromDiffObj(Diff);

        // apply 'ignore' filters. Key needs to match the functions above!
        Selection.words.forEach((word) => {
            Object.entries(options).forEach(([key, yesFilter]) => {
                if (yesFilter) {
                    ignoreFilters[key](word);
                }
            });
        });
        return Selection.package();
    };

    return {
        process: process
    };
})();