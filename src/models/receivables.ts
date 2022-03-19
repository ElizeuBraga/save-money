import Datastore from 'nedb'
import {dates, addZero} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'receivables'

interface Receivable {
    _id: string;
    createdAt: string;
    deletedAt: any;
    updatedAt: any;
    paid: boolean;
    model: string;
    expiration: string;
    parcel: number;
}

export function insertReceivable(doc: Receivable){
    doc.createdAt = dates(Date.now(), 'yyyy-mm-dd')
    doc.deletedAt = null
    doc.updatedAt = null
    doc.paid = false
    doc.model = model
    
    let start = parseInt(dates(doc.expiration, 'mm'))
    let month = parseInt(dates(doc.expiration, 'mm'))
    const expiration = doc.expiration
    const end = (doc.parcel + start)
    let year = parseInt(dates(expiration, 'yyyy'))
    while(start < end){
        if(month > 12){
            year = year + 1
            month = 1
        }
        
        const newDoc = JSON.parse(JSON.stringify(doc))
        newDoc.expiration = String(year) + '-' + addZero(month) + '-' + dates(expiration, 'dd')
        db.insert(newDoc)
        
        month ++
        start ++
    }
}

export function insert(){
    console.log('Teste')
}
export function update(){
    console.log('Teste')
}

export function updateReceivable(doc: Receivable){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
}

export function getPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: true, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getUnPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: false, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDates(){
    return new Promise((resolve) =>{
        db.find({model: model}, {expiration: 1, _id: 0}, function (err: any, docs: any) {
            const response: Array<string> = []

            response.push(dates(null, 'yyyy-mm', 1))

            docs.forEach((e: any) => {
                const date = dates(e.expiration, 'yyyy-mm')
                if(!response.includes(date)){
                    response.push(date)
                }
            });

            response.sort((a: string, b: string)=>{
                return new Date(a).getTime() - new Date(b).getTime() // reverse chronological order
            });
            
            resolve(response)
        });
    })
}

export function getDatesReceivables(){
    return new Promise((resolve) =>{
        db.find({model: model}, {expiration: 1, _id: 0}, function (err: any, docs: any) {
            const response: Array<string> = []

            response.push(dates(null, 'yyyy-mm', 1))

            docs.forEach((e: any) => {
                const date = dates(e.expiration, 'yyyy-mm')
                if(!response.includes(date)){
                    response.push(date)
                }
            });

            response.sort((a: string, b: string)=>{
                return new Date(a).getTime() - new Date(b).getTime() // reverse chronological order
            });
        
            resolve(response)
        });
    })
}

export function dataInMonthGroupByDebtor(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if (!res[value.debtor]) {
                    res[value.debtor] = {debtor: value.debtor, price: 0, quantity: 0};
                    result.push(res[value.debtor])
                }
                res[value.debtor].price += parseFloat(value.price);
                res[value.debtor].quantity += 1
                return res;
            }, {});
            
            resolve(result)
        });
    })
}

export function getDataByDebtor(yearMonth: string, debtor: string){
    return new Promise((resolve) =>{
        db.find({debtor: debtor, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDataByDebtorId(yearMonth: string, debtorId: string){
    return new Promise((resolve) =>{
        db.find({_id: debtorId, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}
