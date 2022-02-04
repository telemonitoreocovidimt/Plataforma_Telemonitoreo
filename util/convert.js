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
                row.push(item[key]);
            });
            return row;
        });
        // const rows = data.map((item) => {
        //     const row = [];
        //     Object.keys(as).forEach(function(key) {
        //         row.push(item[as[key]]);
        //     });
        //     return row;
        // });
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

    static async jsonArrayToExcel(data)  {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('result');
        console.log('Row Raw');
        const rows = await Promise.all(data.map((row) => {
            return Object.values(row);
        }))
        console.log("Rows normalized");
        ws.addTable({
            name: 'MyTable',
            ref: 'A1',
            headerRow: true,
            // totalsRow: true,
            style: {
              theme: 'TableStyleDark1',
              showRowStripes: true,
            },
            columns: Object.keys(data[0]).map((head) => {
                return {name: head};
            }),
            // rows: []
            rows: rows,
        });
        console.log("Sheet generada");
        // ws.addRows(data);
        // await Promise.all(data.map(async (item) => {
        //     await ws.addRow(item).commit();
        // }));
        // await ws.commit();
        // await wb.commit();
        return wb;
    }
} 