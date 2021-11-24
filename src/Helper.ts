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
    if(index){
        return months[index]
    }else{
        return months
    }
}

export function getNextMonthInt(){
    return  new Date(Timestamp.now().toMillis()).getMonth()+2
}

export function getActualYear(){
    return  String(new Date(Timestamp.now().toMillis()).getFullYear())
}

export function userRef(){
    return  doc(getFirestore(), "users", getAuth().currentUser!.uid)
}

export function yearRef(yearArg: any = null){
    const year = (yearArg) ? addZero(yearArg) : getActualYear() 
    return  collection(userRef(), year)
}

export function monthRef(monthArg: any = null, yearArg: any = null){
    const month = (monthArg) ? addZero(monthArg) : addZero(getNextMonthInt()) 
    const year = (yearArg) ? yearArg : getActualYear()
    return  doc(userRef(), String(year), month)
}

export function expRef(month: any, year: any){
    return  collection(monthRef(month, year), 'expenses')
}