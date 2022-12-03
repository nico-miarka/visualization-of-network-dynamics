export function counter (array){
    var count = {};
    array.forEach(val => count[val.level] = (count[val.level] || 0) + 1);
    return count;
}