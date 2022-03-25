import Datastore from 'nedb'
import {dates} from '../Helper'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'categories'

export interface Category {
    _id: string;
    name: string;
}

export function insertCategory(doc: any){
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

export function updateCategory(doc: any){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
}

export function getCategoryById(id: string){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getCategoryByName(name: string){
    return new Promise((resolve) =>{
        db.find({name: name, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getCategorys(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            docs.forEach((element: Category) => {
                response.push(element.name)
            });
            resolve(response)
        });
    })
}

export function getAllCategorys<Category>(){
    return new Promise((resolve) =>{
        db.find({model: model}, function (err: any, docs: Array<Category>) {
            resolve(docs)
        });
    })
}