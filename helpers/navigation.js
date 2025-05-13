module.exports = (objectPagination, query, countPage) => {
    
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }
    objectPagination.indexProduct = parseInt((objectPagination.currentPage - 1) * objectPagination.limitProduct);
    objectPagination.totalPage = Math.ceil(countPage/objectPagination.limitProduct);

    return objectPagination;
}