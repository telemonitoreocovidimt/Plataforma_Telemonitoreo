const ExcelJS = require('exceljs');


module.exports = class Convert {


    static toExcel(data, as) {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('result');
        const headers = Object.keys(as).map(function (key) {
            return {
                'name': key
            }
        });
        const rows = data.map((item) => {
            const row = [];
            Object.keys(as).forEach(function(key) {
                row.push(item[as[key]]);
            });
            return row;
        });
        ws.addTable({
            name: 'MyTable',
            ref: 'A1',
            headerRow: true,
            // totalsRow: true,
            style: {
              theme: 'TableStyleDark1',
              showRowStripes: true,
            },
            columns: headers,
            rows: rows,
        });
        return wb;
    }

} 