//---------------------------------helpers
//#region 
//represents all CRUD operations and their impact in the UI, with this, changes in DB are real-time in the app's UI
const dbToUI = (collectionName, renderFunc, removeFunc) => {
    db.collection(collectionName).onSnapshot((snapObj) =>{
        snapObj.docChanges().forEach((change) =>{
            //console.log(change, change.doc.data(), change.doc.id);
            if(change.type === 'added'){
                //add doc data to the web page
                renderFunc.apply(this, [change.doc.data(), change.doc.id]);
            }
            if(change.type === 'removed'){
                //remove the doc data from the web page
                removeFunc.apply(this, [change.doc.id]);
            }
        })
    })
};

//generic form, CREATE in db based on forms
const genericFormFunc = (className, dbCollectionName, objRepresentation) =>{
    //get form by class name
    const someForm = document.querySelector(className);
    
    someForm.addEventListener('submit', e =>{
        e.preventDefault();//do not refresh
        
        objRepresentation.Populate(someForm); 

        if(!objRepresentation.success){
            //objRepresentation.FreeForm(someForm)
            console.log('fail');
            return;
        }
        console.log('success');
        db.collection(dbCollectionName).add(objRepresentation.data)
        .catch(err => console.log(err));

        objRepresentation.FreeForm(someForm)
    });
}


//#endregion

//---------------------------------Forms to db elements Representations, akin to models in MVC
//#region 

//structure:
// data - all db properties with the exact name are here
// success - successfully populated/validated data
// FreeForm - empty out the form for later use

let ItemRepresentation = {

    data : {
        Name: '',
        Place: '',
        ListID:''
    },

    success : true,

    Populate(someForm){
        let lID = someForm.getAttribute('data-id').toString();
        let n = someForm.itemName.value.toString();
        //cannot allow nameless or listless items to be added to the db
        if( strIsEmpty(lID, 1) || strIsEmpty(n, 3)){
            this.success = false;
            return;
        }
        else{
            this.success = true;
        }
        
        this.data.Name = n;
        this.data.Place = someForm.itemPlace.value;
        this.data.ListID = lID;
    },

    FreeForm(someForm){
        someForm.itemName.value = '';
        someForm.itemPlace.value = '';
    }
};

let ShoppingListRepresentation ={

    data :{
        Name:''
    },

    success : true,

    Populate(someForm){
        const n = someForm.listName.value.toString();

        if(strIsEmpty(n,3)){
            this.success = false;
            return;
        }
        else{
            this.success = true;
        }

        this.data.Name = n;
    },

    FreeForm(someForm){
        someForm.listName.value = '';
    }

};
//#endregion

//---------------------------------db setup

//offline data
db.enablePersistence()
.catch(err =>{
    //multi-tabs opened 
    if(err.code == 'failed-precondition'){
        console.log('persistence failed')
    }//browser does not support it
    else if(err.code == 'unimplemented'){
        console.log('persistence not available');
    }
});

//---------------------------------show db elements&their changes in UI
dbToUI('ShoppingItem', renderItem, removeItem);

dbToUI('ShoppingLists', renderList, removeList);

//---------------------------------db CREATE
genericFormFunc('.add-item','ShoppingItem', ItemRepresentation);

genericFormFunc('.add-list','ShoppingLists', ShoppingListRepresentation);

//---------------------------------db DELETE

//delete single item
const itemContainer = document.querySelector('.items');
itemContainer.addEventListener('click', evt =>{
    //delete Icon clicked
    if(evt.target.tagName === 'I'){
        const id = evt.target.getAttribute('data-id');
        db.collection('ShoppingItem').doc(id).delete();
    }
});

//delete list and all its items
const listTitleContainer = document.querySelector('.listTitleContainer');
listTitleContainer.addEventListener('click', evt =>{
    
    //delete list and all items from db
    if(evt.target.tagName === 'I'){
        const sListTitle = document.querySelector('#ShoppingListTitle');
        const listID = sListTitle.getAttribute('data-id').toString();

        if(strIsEmpty(listID, 1)) return;
        
        //get all items corresponding to the list
        const ref = db.collection("ShoppingItem");
        var query = ref.where("ListID", "==", listID)
            .get()
            .then( (qSnap) =>{
                //remove all items from db
                qSnap.forEach( (doc) =>{
                db.collection('ShoppingItem').doc(doc.id).delete();
            });
        })
        .catch( (err) =>{
            console.log(err);
        });

        //remove the list from db
        db.collection('ShoppingLists').doc(listID).delete();

        //reset UI list title container
        setListContainerAndItemAddForm('', 'Select List', 'New Item (Select List First)');
    }
});
