import Datastore from 'nedb'
import {addZero, dates} from '../Helper'
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
        const expiration = doc.expiration
        const end = (doc.parcel + start)
        let year = parseInt(dates(expiration, 'yyyy'))
        while(start < end){
            if(month > 12){
                year = year + 1
                month = 1
            }
            
            const newDoc = JSON.parse(JSON.stringify(doc))
            newDoc.expiration = String(year) + '-' + addZero(month) + '-' + dates(expiration, 'dd')
            db.insert(newDoc)
            
            month ++
            start ++
        }
    })
}

export function update(doc: Expense){
    doc.updatedAt = dates(Date.now(), 'yyyy-mm-dd')
    db.update({ _id: doc._id }, { $set: doc });
}

export function getPaid(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({paid: true, deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
}

export function getDataByDescription(yearMonth: string, description: string){
    return new Promise((resolve) =>{
        db.find({description: description, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
            resolve(docs)
        });
    })
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

export function dataInMonthGroupByProduct(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
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
        });
    })
}

export function dataInMonthGroupByCategory(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
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
        });
    })
}

export function dataInMonthGroupByRule(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
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
        });
    })
}

export function dataInMonthGroupByPayment(yearMonth: string){
    return new Promise((resolve) =>{
        db.find({deletedAt: null, expiration: new RegExp(yearMonth), model: model}, function (err: any, docs: any) {
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
        });
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

export function getDataByPayment(yearMonth: string, payment: string){
    const object = {
        deletedAt: null, 
        expiration: new RegExp(yearMonth), 
        model: model,
        payment: payment
    }
    return new Promise((resolve) =>{
        db.find(object, function (err: any, docs: any) {
            resolve(docs)
        });
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