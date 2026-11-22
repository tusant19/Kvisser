//pseudo random array order generator that uses text (the question) and the answers as the seed to generate a random order that is consistent for all players.
function pseudoRandomizeArrayOrder(array, text) {
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed += text.charCodeAt(i);
    }
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].answer.length; j++) {
            seed += array[i].answer.charCodeAt(j);
        }
    }
    let originalArray = [...array];
    let randomizedArray = originalArray.sort(() => {
        let random = Math.sin(seed++) * 10000;
        return random - Math.floor(random);
    });
    return randomizedArray;
}

export default pseudoRandomizeArrayOrder;