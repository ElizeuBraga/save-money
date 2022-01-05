import { getAuth } from "firebase/auth"
import { Timestamp, doc, getFirestore, collection} from "firebase/firestore"

export function dates(date: string){
    const day = new Date(date).getDate() + 1
    const month = new Date(date).getMonth() + 1
    const year = new Date(date).getFullYear()

    return {
        day: String(((day < 10) ? '0' + day : day)),
        month: String(((month < 10) ? '0' + month : month)),
        year: String(year)
    }
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