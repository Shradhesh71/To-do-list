
//   below this are full details to export
module.exports.getDate = getdate;

function getdate() {
    const today = new Date();
    const options ={
        weekday : "long",
        day:"numeric",
        month : "long",
        year : "numeric",
    };
    const day = today.toLocaleDateString("en-US",options);
    return day;
};

//  below are use shortcuts for export
exports.getDay = () => {
    const today = new Date();
    const options ={
        weekday : "long",
    };
    return today.toLocaleDateString("en-US",options);
};

// console.log(module.exports);