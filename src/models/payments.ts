import Datastore from 'nedb'
import {dates} from '../Helper'
import {insertDoc, updateDoc} from './db'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'payments'

interface Person {
    name: string;
}

export function insertPayment(doc: any){
    return new Promise(() =>{
        doc.deletedAt = null
        doc.updatedAt = null
        doc.model = model
        insertDoc(doc)
    })
}

export function updatePayment(doc: any){
    updateDoc(doc)
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