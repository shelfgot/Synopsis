// if word has added and we don't ignore it, color it red
            /*const fragment = document.createDocumentFragment();
            const fullColor = word.hasNonIgnoredAddedLetter();

            for(const item of word.getAllLetters()) {
                let node;
                if (item.type == 'removed') {
                    node = document.createElement('del');
                    node.textContent = ``;
                } else {
                    node = (fullColor) ? document.createElement('del') : document.createElement('span');
                    node.textContent = `${item.token}`;
                }

                if (node) fragment.appendChild(node);
                
            };
            const space = document.createElement('span');
            space.textContent = " ";
            fragment.appendChild(space);
            result.appendChild(fragment);
            */