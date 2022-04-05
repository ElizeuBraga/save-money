import Datastore from 'nedb'
import {dates} from '../Helper'
import {insertDoc, updateDoc} from './db'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'persons'

interface Person {
    name: string;
}

export function insertPerson(doc: any){
    return new Promise((resolve) =>{
        doc.deletedAt = null
        doc.updatedAt = null
        doc.model = model
        insertDoc(doc)
    })
}

export function updatePerson(doc: any){
    updateDoc(doc)
}

export function getPersonById(id: string){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getPersonByName(name: string){
    return new Promise((resolve) =>{
        db.find({name: name, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getPersons(){
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

export function getAllPersons(){
    return new Promise((resolve) =>{
        const response: Array<string> = []
        db.find({model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}