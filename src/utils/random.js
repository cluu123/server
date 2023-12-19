module.exports = (min, max, num) => new Promise(res => {
    const getNum = () => Math.floor(Math.random() * (max - min) + 1);
    let str = '';
    while (true) {
        if (str.length >= num) {
            res(str);
            break;
        }
        str += `${getNum()}`;
    }
});
