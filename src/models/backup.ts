import { doc, setDoc, getDoc, getFirestore, getDocs,collection } from "firebase/firestore";
import {selectOne, insertDoc, updateDoc} from './db'
const model = 'backup'
const firestore = getFirestore();

export async function backup(docObj: any){
    await setDoc(doc(firestore, "61998636231", docObj._id), docObj)
}

export async function restore(){
    const docs = await getDocs(collection(firestore, "61998636231"));
    
    for (const iterator of docs.docs) {
        const serverDoc = iterator.data()
            const params = {
                _id: serverDoc._id
            }
    
            const localDoc = await selectOne(params)

            if(!localDoc){
                insertDoc(serverDoc)
            }
    }
}