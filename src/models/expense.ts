import Datastore from 'nedb'
import {dates} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'expenses'

export function insert(doc: any){
    return new Promise((resolve) =>{
        doc.createdAt = dates(Date.now(), 'yyyy-mm-dd')
        doc.deletedAt = null
        doc.updatedAt = null
        doc.paid = false
        doc.model = model
        db.insert(doc, (err, doc)=>{
            resolve(doc)
        });
    })
}

export function update(doc: any){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
    // db.insert(doc);
}

export function getPaid(yearMonth: string, filter: string){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({paid: true, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if(filter === 'description'){
                    if (!res[value.description]) {
                        res[value.description] = { _id: value._id, description: value.description, expiration: value.expiration, price: 0, payment: value.payment, quantity: 0};
                        result.push(res[value.description])
                    }
                    res[value.description].price += parseFloat(value.price);
                    res[value.description].quantity += 1
                }else{
                    if (!res[value.payment]) {
                        res[value.payment] = { _id: value._id, description: value.payment, expiration: value.payment, price: 0, payment: value.payment, quantity: 0};
                        result.push(res[value.payment])
                    }
                    res[value.payment].price += parseFloat(value.price);
                    res[value.payment].quantity += 1
                }
                return res;
            }, {});
            resolve(result)
        });
    })
}

export function getDataByDescription(yearMonth: string, description: string, paid: boolean){
    return new Promise((resolve) =>{
        db.find({description: description, paid: paid, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDataById(id: boolean){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getUnPaid(yearMonth: string, filter: string){
    return new Promise((resolve) =>{
        db.find({paid: false, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if(filter === 'description'){
                    if (!res[value.description]) {
                        res[value.description] = { _id: value._id, description: value.description, expiration: value.expiration, price: 0, payment: value.payment, quantity: 0};
                        result.push(res[value.description])
                    }
                    res[value.description].price += parseFloat(value.price);
                    res[value.description].quantity += 1
                }else{
                    if (!res[value.payment]) {
                        res[value.payment] = { _id: value._id, description: value.payment, expiration: value.payment, price: 0, payment: value.payment, quantity: 0};
                        result.push(res[value.payment])
                    }
                    res[value.payment].price += parseFloat(value.price);
                    res[value.payment].quantity += 1
                }
                return res;
            }, {});
            resolve(result)
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