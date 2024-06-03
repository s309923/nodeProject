"use strict"
const fs = require('fs');
const csv = require('csv-parser');

if (process.argv.length < 3) {
    console.error('Errore nella linea di comando, usare: node read_csv.js <filename.csv>');
    process.exit(1);
}

const filename = process.argv[2];

if (!fs.existsSync(filename)) {
    console.error(`Il file non esiste.`);
    process.exit(1);
}

function printRecord(id, articleName, quantity, unitPrice, percentageDiscount, buyer) {
    console.log(
        "- " + id + ", " + articleName + ", " + quantity + ", " + unitPrice + ", " + percentageDiscount + ", " + buyer
    )
}
function newRecord(id, articleName, quantity, unitPrice, percentageDiscount, buyer) {
    return {
        id: id,
        articleName: articleName,
        quantity: parseInt(quantity),
        unitPrice: parseInt(unitPrice),
        percentageDiscount: parseFloat(percentageDiscount),
        buyer: buyer,
        tot: 0.0
      };
}

let ordini = []

fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
        ordini.push(newRecord(row.Id,row['Article Name'],row.Quantity,row['Unit price'],row['Percentage discount'], row.Buyer))
    })
    .on('end', () => {
        console.log('Lettura del file completata')
        printResult()
    })
    .on('error', (err) => {
        console.error('Errore durante lettura del file', err);
});

function printResult(){
    const maxTotalPrice = ordini.map(it => ({ ...it, tot: (it.quantity * it.unitPrice - (it.quantity * it.unitPrice * it.percentageDiscount/100)) }))
                                .reduce((maxTot, record) => record.tot > maxTot.tot ? record : maxTot)
    console.log("Record con importo totale più alto:");
    printRecord(maxTotalPrice.id, maxTotalPrice.articleName, maxTotalPrice.quantity, maxTotalPrice.unitPrice, maxTotalPrice.percentageDiscount, maxTotalPrice.buyer)
    
    const maxQuantity = ordini.reduce((maxQuantity, record) =>
        record.quantity > maxQuantity.quantity ? record : maxQuantity)
    console.log("Record con quantità più alta:")
    printRecord(maxQuantity.id, maxQuantity.articleName, maxQuantity.quantity, maxQuantity.unitPrice, maxQuantity.percentageDiscount, maxQuantity.buyer)
    
    const maxDifferences = ordini.map(it => ({ ...it, tot: ((it.quantity * it.unitPrice)-(it.quantity * it.unitPrice - (it.quantity * it.unitPrice * it.percentageDiscount/100))) }))
                                 .reduce((maxDiff, record) => record.tot > maxDiff.tot ? record : maxDiff)
    console.log("Record con massima differenza tra sconto e senza sconto:");
    printRecord(maxDifferences.id, maxDifferences.articleName, maxDifferences.quantity, maxDifferences.unitPrice, maxDifferences.percentageDiscount, maxDifferences.buyer)
}