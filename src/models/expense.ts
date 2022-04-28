import Datastore from 'nedb'
import {addZero, dates} from '../Helper'
import {insertDoc, updateDoc, select, selectOne} from './db'
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'expenses'

interface Expense {
    _id: string;
    description: string;
    createdAt: string;
    deletedAt: any;
    updatedAt: any;
    paid: boolean;
    model: string;
    expiration: string;
    parcel: number;
    rule: string;
    category: string;
}

export function insert(doc: Expense){
    return new Promise(() =>{
        doc.createdAt = dates(Date.now(), 'yyyy-mm-dd')
        doc.deletedAt = null
        doc.updatedAt = null
        doc.paid = false
        doc.model = model
        
        let start = parseInt(dates(doc.expiration, 'mm'))
        let month = parseInt(dates(doc.expiration, 'mm'))
        let countParcel = 1;

        const expiration = doc.expiration
        const end = (doc.parcel + start)
        let year = parseInt(dates(expiration, 'yyyy'))
        while(start < end){
            if(month > 12){
                year = year + 1
                month = 1
            }
            
            const newDoc = JSON.parse(JSON.stringify(doc))
            newDoc.parcelInfo = `${countParcel}/${doc.parcel}`
            newDoc.expiration = String(year) + '-' + addZero(month) + '-' + dates(expiration, 'dd')
            insertDoc(newDoc)

            month ++
            start ++
            countParcel ++
        }
    })
}

export async function update(doc: Expense){
    return new Promise((resolve) =>{
        resolve(updateDoc(doc))
    })
}

export function getPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: true, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export async function getDataByDescription(params: any){
    const data = await selectOne(params) 
    console.log(data)
}

export function getDataById(id: boolean){
    return new Promise((resolve) =>{
        db.find({_id: id, model: model}, function (err: any, docs: any) {
            resolve(docs[0])
        });
    })
}

export function getUnPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: false, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export async function dataInMonthGroupByProduct(yearMonth: string){
    const params = {deletedAt: null, expiration: new RegExp(yearMonth), model: model}
    const docs: Array<Expense> = await select(params) as Array<Expense>

    return new Promise((resolve) =>{
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if (!res[value.description]) {
                    res[value.description] = {description: value.description, price: 0, quantity: 0, paid: true};
                    result.push(res[value.description])
                }

                if(!value.paid){
                    res[value.description].paid = false
                }
                
                res[value.description].price += parseFloat(value.price);
                res[value.description].quantity += 1
                return res;
            }, {});
            
            resolve(result)
    })
}

export async function dataInMonthGroupByCategory(yearMonth: string){
    const params = {deletedAt: null, expiration: new RegExp(yearMonth), model: model}
    const docs: Array<Expense> = await select(params) as Array<Expense>

    return new Promise((resolve) =>{
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if (!res[value.category]) {
                    res[value.category] = {category: value.category, price: 0, quantity: 0, paid: true};
                    result.push(res[value.category])
                }

                if(!value.paid){
                    res[value.category].paid = false
                }

                res[value.category].price += parseFloat(value.price);
                res[value.category].quantity += 1
                return res;
            }, {});

            resolve(result)
    })
}

export async function dataInMonthGroupByRule(yearMonth: string){
    const params = {deletedAt: null, expiration: new RegExp(yearMonth), model: model}
    const docs: Array<Expense> = await select(params) as Array<Expense>
    return new Promise((resolve) =>{
            const result: any = []
            docs.reduce(function(res: any, value: any) {
                if (!res[value.rule]) {
                    res[value.rule] = {rule: value.rule, price: 0, quantity: 0, paid: true};
                    result.push(res[value.rule])
                }

                if(!value.paid){
                    res[value.rule].paid = false
                }

                res[value.rule].price += parseFloat(value.price);
                res[value.rule].quantity += 1
                return res;
            }, {});

            resolve(result)
    })
}

export async function dataInMonthGroupByPayment(yearMonth: string){
    const params = {deletedAt: null, expiration: new RegExp(yearMonth), model: model}
    const docs: Array<Expense> = await select(params) as Array<Expense>

    return new Promise((resolve) =>{
        const result: any = []
        docs.reduce(function(res: any, value: any) {
            if (!res[value.payment]) {
                res[value.payment] = {payment: value.payment, price: 0, quantity: 0, paid: true};
                result.push(res[value.payment])
            }

            if(!value.paid){
                res[value.payment].paid = false
            }

            res[value.payment].price += parseFloat(value.price);
            res[value.payment].quantity += 1
            return res;
        }, {});

        resolve(result)
    })
}

export function getDatesExpenses(){
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

export async function getDataByPayment(yearMonth: string, payment: string){
    const params = {
        deletedAt: null, 
        expiration: new RegExp(yearMonth), 
        model: model,
        payment: payment
    }

    const docs: Array<Expense> = await select(params) as Array<Expense>

    return new Promise((resolve) =>{
        resolve(docs)
    })
}

export function getDataByCategory(yearMonth: string, category: string){
    const object = {
        deletedAt: null, 
        expiration: new RegExp(yearMonth), 
        model: model,
        category: category
    }
    return new Promise((resolve) =>{
        db.find(object, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDataByProduct(yearMonth: string, product: string){
    const object = {
        deletedAt: null, 
        expiration: new RegExp(yearMonth), 
        model: model,
        description: product
    }
    return new Promise((resolve) =>{
        db.find(object, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDataByRule(yearMonth: string, rule: string){
    const object = {
        deletedAt: null, 
        expiration: new RegExp(yearMonth), 
        model: model,
        rule: rule
    }
    return new Promise((resolve) =>{
        db.find(object, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDeletedExpense(yearMonth: string){
    const object = {
        expiration: new RegExp(yearMonth), 
        model: model,
        deletedAt : { 
            $ne : null
        }
    }
    return new Promise((resolve) =>{
        db.find(object, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function updateExpenseCategory(oldCategory: string, newCategory: string){
    db.update({ category: oldCategory }, { $set: {category: newCategory, updatedAt: dates(Date.now(), 'yyyy-mm-dd')}}, {multi: true});
}

export function updateExpensePayment(oldPayment: string, newPayment: string){
    db.update({ payment: oldPayment }, { $set: {payment: newPayment, updatedAt: dates(Date.now(), 'yyyy-mm-dd')}}, {multi: true});
}