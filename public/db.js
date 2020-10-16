const indexDB = window.indexedDB;
let db
const request = indexDB.open("Budget",1)

request.onupgradeneeded = (evt)=>{
    let db = evt.target.result
    db.createObjectStore("pending", {
        autoIncrement: true
    })
}
request.onsuccess = (evt)=>{
    db = evt.target.result
    if(navigator.onLine){
        initializeDB()
    }
}
request.onerror = (evt)=>{
    console.log("Something went wrong!")
}
function initializeDB(){
    let tr = db.transaction(["pending"],"readwrite")
    let store = tr.objectStore("pending")
    let getAll = store.getAll()

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch("/api/transaction/bulk",{
                method: "POST",
                body: JSON.stringify(getAll.result)
            }).then(function(response){
                return response.json()
            }).then(function(){
                let tr = db.transaction(["pending"],"readwrite")
                let store = tr.objectStore("pending")
                store.clear()
            })
        }
    }
}
function saveRecord(record){
    let tr = db.transaction(["pending"],"readwrite")
    let store = tr.objectStore("pending")
    store.add(record)
}
window.addEventListener("online", initializeDB)