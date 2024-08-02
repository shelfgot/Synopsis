/*
The following is an algorithm to match up pairs in a given Diff array object.
To fix:
1) Eiruvin 86: shetei ushenei at top
*/

const hebrewNumberLetters = {
   'אחד': 'א',    
   'אחת': 'א',    
   'שניים': 'ב',  
   'שנים': 'ב',   
   'שתיים': 'ב',  
   'שתים': 'ב',  
   'שתי': 'ב',  
   'שני': 'ב',  
   'שלושה': 'ג',  
   'שלשה': 'ג',   
   'שלוש': 'ג',
   'שלש': 'ג',   
   'ארבעה': 'ד',  
   'ארבע': 'ד',   
   'חמישה': 'ה',  
   'חמשה': 'ה',   
   'חמש': 'ה',    
   'שישה': 'ו',   
   'ששה': 'ו',    
   'שש': 'ו',     
   'שבעה': 'ז',   
   'שבע': 'ז',    
   'שמונה': 'ח',  
   'תשעה': 'ט',   
   'תשע': 'ט',    
   'עשרה': 'י',   
   'עשר': 'י',    

   'ראשון': 'א',
   'ראשונה': 'א',
   'שני': 'ב',
   'שנית': 'ב',
   'שלישי': 'ג',
   'שלישית': 'ג',
   'רביעי': 'ד',
   'רביעית': 'ד',
   'חמישי': 'ה',
   'חמישית': 'ה',
   'שישי': 'ו',
   'שישית': 'ו',
   'שביעי': 'ז',
   'שביעית': 'ז',
   'שמיני': 'ח',
   'שמינית': 'ח',
   'תשיעי': 'ט',
   'תשיעית': 'ט',
   'עשירי': 'י',
   'עשירית': 'י',
   
   
   'עשרים': 'כ',  
   'שלושים': 'ל', 
   'ארבעים': 'מ', 
   'חמישים': 'נ', 
   'שישים': 'ס',  
   'שבעים': 'ע',  
   'שמונים': 'פ', 
   'תשעים': 'צ',  
   'מאה': 'ק'     
}
const numberShorts = Object.keys(hebrewNumberLetters).join("|");

// helper function to see if any word in the larger string starts with substring
let startsWithSubstringInWords = (largerString, substring) => {
    const words = largerString.split(' ');
    let is_sub = words.some(word => word.startsWith(substring));
    return is_sub;
}

// Some of these filters were inspired by Ephraim Meiri. תשו"ח לו
const filters = {
    // note: not a reflexive function!
    mnSwitch: (a,b, otherWords, index) => {
        if ((a.slice(-1) == "ן" && b.slice(-1) == "ם")) {
                if (a.substring(0, a.length - 1) == b.substring(0, b.length - 1)) return true;
            }
    },
    // note: not a reflexive function!
    numberCheck: (a,b, otherWords, index) => {
        // e.g. והג'
        if (a.slice(-1) == "'" && a.length <= 4) {
            let shortNumber = b.match(new RegExp(numberShorts));
            if (shortNumber) {
                if (a.match(new RegExp(hebrewNumberLetters[shortNumber]))) {
                    return true;
                }
            }
        }
    },
    // note: not a reflexive function! needs to be run twice
    kitzurCheck: (a, b, otherWords, index) => {
            // remove tchuptchik
            const baseWord = a.trim().slice(0, -1);
            //console.log(baseWord);
            if (a.slice(-1) === "'") {
                // iterate around word
                for (let j = Math.max(index - 2, 0); j <= Math.min(index + 2, otherWords.length - 1); j++) {
                    // we don't want to self-compare
                   // console.log(a+"; index is "+index+" and j is "+j);
                   // console.log(otherWords);

                    if (j === index) continue;

                    const otherWordValue = otherWords[j].value.trim();
                    const isExpansion = otherWordValue.includes(baseWord) && otherWordValue !== baseWord;
                    if (isExpansion) {
                        return true;
                    }
                }
            } else {
                // iterate around word
                for (let j = Math.max(index - 2, 0); j <= Math.min(index + 2, otherWords.length - 1); j++) {
                    if (j === index) continue; 

                    const otherWordValue = otherWords[j].value.trim();
                    

                    if (otherWordValue.slice(-1) === "'") {
                        const isContraction = baseWord.includes(otherWordValue.slice(0, -1));
                        if (isContraction) {
                            return true;
                        }
                    }
                }
            }
    },
    rasheiTeivot: (a,b, otherWords, index) => {
        if (a.includes("\"")) {
            let lettersInRT = a.split("");

            // ensure that only words are quoted
            let index = 0;
            for (letter in lettersInRT) {

                /*check first letter of the following words. 
                This is a good first pass, but at times the ר"ת take more than one letter per word.*/
                if (letter != thisAndfollowingWords[index].charAt(0)) {
                    return false;
                };
                index++;
            }
            return true
        }
    }
}


let process = function(changeObj, options) {

    console.log(structuredClone(changeObj));
    
    //1. Remove blank space

    for ( let i = changeObj.length - 2; i > 1; i-- ) {
        //remove hanging blank tokens
        if (changeObj[i+1] && changeObj[i+1].value.trim() == "") {
            changeObj.splice(i+1, 1);
        }
    }

    // 2. Apply filters

    for (let k = 0; k < changeObj.length - 2; k++) {
        //2a. Process filters
        for (const [key, value] of Object.entries(options)) {
            if (value) {
                let a = changeObj[k].value.trim();
                let b = changeObj[k+1].value.trim();
                //console.log("a is "+a+" and index is "+k);
                let clockwise = filters[key](a,b, changeObj, k);
                let anticlockwise = filters[key](b,a, changeObj, k);
                if (clockwise || anticlockwise) {
                    changeObj[k]["mask"] = true;
                }
            }
        }
    }

    //3. Remove notations on tokens from base text, such that only the new text (fully marked up) remains

    for ( let j = changeObj.length - 1; j > 0; j-- ) {
        
        if (changeObj[j-1] && changeObj[j] && 
            changeObj[j-1].added === undefined && 
            changeObj[j].added) {
            
            // handle flip case: e.g. לאו מי משוי' and לא משוינן -- that is, מי=משוינן and then משוי' 
            if (changeObj[j+1] && changeObj[j+1].added && !(changeObj[j+1].hasOwnProperty("flip"))) {
                let swap = changeObj[j-1];
                changeObj[j-1] = changeObj[j];
                changeObj[j-1].flip = true;
                changeObj[j] = swap;
                changeObj.splice(j+1, 1);
            }
            if (!(changeObj[j].hasOwnProperty("flip")) && changeObj[j].added === true) {
                changeObj.splice(j, 1);
            }
        }
    }


    return changeObj;
}

