import Datastore from 'nedb'
import {dates} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'expenses'

export function insert(doc: any){
    doc.createdAt = dates(Date.now(), 'yyyy-mm-dd')
    doc.deletedAt = null
    doc.updatedAt = null
    doc.paid = false
    doc.model = model
    db.insert(doc);
}

export function update(doc: any){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
    // db.insert(doc);
}

export function getPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: true, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            console.log(yearMonth)
            resolve(docs)
        });
    })
}

export function getUnPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: false, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            console.log(yearMonth)
            resolve(docs)
        });
    })
}

export function getDates(){
    return new Promise((resolve) =>{
        db.find({model: model}, {expiration: 1, _id: 0}, function (err: any, docs: any) {
            const response: Array<string> = []

            response.push(dates(null, 'yyyy-mm'))

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