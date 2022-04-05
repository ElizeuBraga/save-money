import Datastore from 'nedb'
import {insertDoc, updateDoc} from './db'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'roles'

interface Person {
    name: string;
}

export function insertRole(doc: any){
    return new Promise((resolve) =>{
        doc.deletedAt = null
        doc.updatedAt = null
        doc.model = model
        insertDoc(doc)
    })
}

export function updateRole(doc: any){
    updateDoc(doc)
}

export function getRoleById(id: string){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getRoleByName(name: string){
    return new Promise((resolve) =>{
        db.find({name: name, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getRules(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            docs.forEach((element: Person) => {
                response.push(element.name)
            });

            response.sort((a, b)=>{
                return parseInt(b) - parseInt(a)
            })
            resolve(response)
        });
    })
}

export function getAllRules(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            docs.sort((a: any, b: any)=>{
                return parseInt(b.name) - parseInt(a.name)
            })
            resolve(docs)
        });
    })
}