import Datastore from 'nedb'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true})
import {backup} from './backup'
import {dates} from '../Helper'

export function insertDoc(docObj: any){
    docObj.createdAt = dates(Date.now(), 'yyyy-mm-dd')
    db.insert(docObj, (err, insertedDoc)=>{
        backup(insertedDoc)
    })
}

export function updateDoc(docObj: any){
    return new Promise((resolve) =>{
        docObj.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
        db.update({ _id: docObj._id }, { $set: docObj })

        backup(docObj)

        resolve(true)
    })
}

export function select(params: any){
    return new Promise((resolve) =>{
        db.find(params, function (err: any, docs: []) {
            resolve(docs)
        });
    })
}

export async function selectOne(params: any){
    return new Promise((resolve) =>{
        db.find(params, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}