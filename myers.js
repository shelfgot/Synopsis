function myersDiff(oldTokens, newTokens) {
    const m = oldTokens.length;
    const n = newTokens.length;

    const max = m + n;

    //furthest point (k-line) for each D.
    const v = new Map();
    v.set(1, 0);

    let path = [];

    //get shortest edit script
    for (let d = 0; d <= max; d++) {
        path[d] = new Map();
        for (let k = -d; k <= d; k += 2) {
            let x;

            if (k === -d || (k !== d && v.get(k - 1) < v.get(k + 1))) {
                x = v.get(k + 1);
            } else {
                x = v.get(k - 1) + 1;
            }

            let y = x - k;

            //follow diagonal while matching tokens
            while (x < m && y < n && oldTokens[x] === newTokens[y]) {
                x++;
                y++;
            }

            v.set(k, x);
            path[d].set(k, { x, y });

            //check for end
            if (x >= m && y >= n) {
                return buildChanges(path, oldTokens, newTokens);
            }
        }
    }
}

function buildChanges(path, oldTokens, newTokens) {
    const changes = [];
    let d = path.length - 1;
    let x = oldTokens.length;
    let y = newTokens.length;

    while (d >= 0) {
        const k = x - y;
        const step = path[d].get(k);

        let prevK;
        if (k === -d || (k !== d && path[d - 1] && path[d - 1].has(k - 1) && path[d - 1].get(k - 1).x < path[d - 1].get(k + 1)?.x)) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }

        const prevStep = path[d - 1]?.get(prevK);

        //backtrack to construct the list, privileging diagonals
        while (x > (prevStep?.x || 0) && y > (prevStep?.y || 0)) {
            changes.unshift({ type: "unchanged", token: oldTokens[x - 1] });
            x--;
            y--;
        }

        if (x > (prevStep?.x || 0)) {
            changes.unshift({ type: "removed", token: oldTokens[x - 1] });
            x--;
        } else if (y > (prevStep?.y || 0)) {
            changes.unshift({ type: "added", token: newTokens[y - 1] });
            y--;
        }

        d--;
    }
    //console.log(changes);
    return changes;
}

