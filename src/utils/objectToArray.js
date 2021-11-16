const objectToArray = (array) => {
    var keyList = Object.keys(array[0])
    var result = {}
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        for (let j = 0; j < keyList.length; j++) {
            const key = keyList[j];
            var temp = []
            if (result[key] != null) {
                temp = result[key]
            }
            temp.push(item[key])
            result[key] = temp
        }

    }
    return { result, keyList }
}

module.exports = objectToArray