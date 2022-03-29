import Datastore from 'nedb'
import {dates} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'system'

// interface System {
//     version: string;
// }

export function insertSystem(doc: any){
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

export function updateSystem(doc: any){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
}

export function systemExists(){
    return new Promise((resolve) =>{
        db.find({model: model}, function (err: any, docs: any) {
            if(docs.length > 0){
                resolve(true)    
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