

module.exports = class Parser {

    static toSQLParameters(json) {
        return Object.keys(json).map((key) => {
            if (typeof json[key] === 'string') {
                return `${key}='${json[key]}'`;
            } else {
                return `${key}=${json[key]}`;
            }
        }).join(", ");
    }

}