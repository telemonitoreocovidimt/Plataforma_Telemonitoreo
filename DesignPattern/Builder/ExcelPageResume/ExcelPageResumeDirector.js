
module.exports = class ExcelPageResumeDirector {

    constructor(concreteBuilder) {
        this.concreteBuilder = concreteBuilder;
    }

    async build() {
        await this.concreteBuilder.buildData();
        this.concreteBuilder.buildSize();
        this.concreteBuilder.buildHeaders();
        this.concreteBuilder.buildRows();
        this.concreteBuilder.buildSheetName();
        this.concreteBuilder.buildExceptions();
    }

    getExcelPageResume() {
        return this.concreteBuilder.getExcelPageResume();
    }

}