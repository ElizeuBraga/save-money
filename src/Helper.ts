import { getAuth } from "firebase/auth"
import { Timestamp, doc, getFirestore, collection} from "firebase/firestore"

export function dates(date: any, format: any, addMonth = 0, addYear =  0){
    date = !date ? Date.now() : date
    let day = String(new Date(date).getDate())
    let month = String(new Date(date).getMonth() + 1 + addMonth)
    let year = String(new Date(date).getFullYear())
    
    day = (parseInt(day) < 10) ? '0' + day : day
    month =  (parseInt(month) < 10) ? '0' + month : month
    year = String(year)

    let dateFormated = null
    if(format === 'dd/mm/yyyy'){
        dateFormated = day + '/' + month + '/' + year
    }else if(format === 'dd-mm-yyyy'){
        dateFormated = day + '-' + month + '-' + year
    }else if(format === 'dd'){
        dateFormated = day
    }else if(format === 'dd/mm'){
        dateFormated = day + '/'+ month
    }else if(format === 'mm'){
        dateFormated = month
    }else if(format === 'yyyy'){
        dateFormated = year
    }else if(format === 'mm-yyyy'){
        dateFormated = month + '-' + year
    }else if(format === 'mm/yyyy'){
        dateFormated = month + '/' + year
    }else if(format === 'yyyy-mm'){
        dateFormated = year + '-' + month
    }else{
        dateFormated = year + '-' + month + '-' + day 
    }

    return dateFormated
}

export function addZero(num: number){
    return (num < 10) ? ('0' + num) : String(num)
}

export function getMonths(index: number){
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    if(index || index === 0){
        return months[index]
    }else{
        return months
    }
}

export function getNextMonthInt(){
    const month = new Date(Timestamp.now().toMillis()).getMonth() + 1
    if(month === 12){
        return 1
    }
    return month
}

export function getActualMonthInt(){
    const month = new Date(Timestamp.now().toMillis()).getMonth() + 1
    return month;
}

export function getNextMonthIndex(){
    return getNextMonthInt() - 1
}

export function getActualYear(){
    return  new Date(Timestamp.now().toMillis()).getFullYear()
}

export function userRef(){
    return  doc(getFirestore(), "users", getAuth().currentUser!.uid)
}

export function yearRef(year: any = null){
    return  collection(userRef(), String(year))
}

export function monthRef(year: any = null, month: any = null){
    return  doc(userRef(), String(year), addZero(month))
}

export function expRef(year: any, month: any){
    return  collection(monthRef(year, month), 'expenses')
}

export function toReceiveRef(year: any, month: any){
    return  collection(monthRef(year, month), 'toReceiveFromThirdParties')
}

export function formatInputReal(value: any){
    return (parseInt(String(value).replace('.', '')) / 100).toFixed(2);
}

export function formatInputRealV2(value: any){
    console.log(value)
    const result = (parseInt(String(value).replace('.', '')) / 100).toFixed(2);
    console.log(result)
    return result 
}

export function formatInputRealV3(value: any){
    return parseFloat(value).toFixed(2);
}

export function sumElements(array: any, field: any){
    let total = 0

    if(!field){
        for (const element of array) {
            if(element.doubt !== true){
                total += parseFloat(element[field])
            }
        }

        return total
    }

    for (const element of array) {
        if(element.doubt !== true){
            total += parseFloat(element[field])
        }
    }
    return total
}

export function sum(array: any, field: any){
    let total = 0

    for (const element of array) {
        total += parseFloat(element[field])
    }

    return total
}