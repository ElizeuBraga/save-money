import Datastore from 'nedb'
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
const db = new Datastore({ filename: 'src/database/db.db', autoload: true })
const model = 'backup'
const firestore = getFirestore();

export function backup(docObj: any){
    setDoc(doc(firestore, "61998636231", docObj._id), docObj);
}

export async function updateLocal(){
    const docRef = doc(firestore, "backups", "backup");
    const docSnap = await getDoc(docRef);

    const data = JSON.parse(docSnap.data()!.stringbackup)

    db.remove({}, {multi: true}, function (err, numRemoved) {
        console.log(numRemoved)
    });

    db.insert(data)
}