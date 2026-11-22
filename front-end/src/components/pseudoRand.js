//pseudo random array order generator that uses text (the question) and the answers as the seed to generate a random order that is consistent for all players. (seeder fisher-yates shuffle)
function pseudoRandomizeArrayOrder(array, text) {
    console.log("pseudoRandomizeArrayOrder called with array: ", array, " and text: ", text);
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed += text.charCodeAt(i);
    }
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].answer.length; j++) {
            seed += array[i].answer.charCodeAt(j);
        }
    }
    seed = seed % 2147483647;
    function random() {
        seed = (seed * 48271) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    console.log("pseudoRandomizeArrayOrder returning shuffled array: ", shuffledArray);

    return shuffledArray;
    
}

export default pseudoRandomizeArrayOrder;