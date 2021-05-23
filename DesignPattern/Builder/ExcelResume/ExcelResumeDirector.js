
module.exports = class ExcelPageResumeListDirector {

    constructor(concreteBuilder) {
        this.concreteBuilder = concreteBuilder;
    }

    async build() {
        await this.concreteBuilder.buildPages();
        this.concreteBuilder.buildAmount();
        this.concreteBuilder.buildSize();
        this.concreteBuilder.buildName();
        this.concreteBuilder.buildExceptions();
    }

    getExcelResume() {
        return this.concreteBuilder.getExcelResume();
    }

}