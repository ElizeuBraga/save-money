import Datastore from 'nedb'
import {dates} from '../Helper'
import {insertDoc, updateDoc} from './db'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'system'

// interface System {
//     version: string;
// }

export function insertSystem(doc: any){
    return new Promise((resolve) =>{
        doc.deletedAt = null
        doc.updatedAt = null
        doc.model = model

        insertDoc(doc)
    })
}

export function updateSystem(doc: any){
    updateDoc(doc)
}

export function systemExists(){
    return new Promise((resolve) =>{
        db.find({model: model}, function (err: any, docs: any) {
            if(docs.length > 0){
                resolve(docs[0])    
            }
            resolve(false)
        });
    })
}

export function geSystemData(){
    return new Promise((resolve) =>{
        db.find({model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}