let count = 0;
const createTree = (arr, parenId = "") => {
    const tree = [];
    arr.forEach(element => {
        if (element.paren_id === parenId){
            count++;
            const newItem = element;
            newItem.index = count;
            const children = createTree(arr, element.id);
            if (children.length > 0) {
                newItem.children = children;
            }
            tree.push(newItem);
        }
    });
    return tree;
};

module.exports.tree = (arr, parenId = "") => {
    count = 0;
    const tree = createTree(arr, parenId = "");
    return tree;
};