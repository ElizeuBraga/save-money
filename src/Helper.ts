import { getFirestore, doc, updateDoc, onSnapshot, addDoc, collection, setDoc, deleteDoc, Timestamp, arrayUnion} from "firebase/firestore"
import { getAuth } from "firebase/auth"

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