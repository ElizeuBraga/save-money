import Datastore from 'nedb'
import {dates} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'payments'

interface Person {
    name: string;
}

export function insertPayment(doc: any){
    return new Promise((resolve) =>{
        doc.createdAt = dates(Date.now(), 'yyyy-mm-dd')
        doc.deletedAt = null
        doc.updatedAt = null
        doc.model = model
        db.insert(doc, (err, doc)=>{
            resolve(doc)
        })
    })
}

export function updatePayment(doc: any){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
}

export function getPaymentById(id: string){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getPaymentByName(name: string){
    return new Promise((resolve) =>{
        db.find({name: name, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getPayments(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            docs.forEach((element: Person) => {
                response.push(element.name)
            });
            resolve(response)
        });
    })
}

export function getAllPayments(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}