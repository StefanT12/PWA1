const items = document.querySelector('.items');
const lists = document.querySelector('.lists');

//----------------------------------------------
//#region render data

const renderItem = (data, id) => {
  //html templating, id is in two places, at the root (div) to grab the item in case db changed or is deleted within the app
  let shoppingListID = document.querySelector('#ShoppingListTitle').getAttribute('data-id').toString();
  if(data.ListID === shoppingListID){
    const html = `
      <div class="card-panel item white row" data-id="${id}">
      <img src="/img/app/bag.png" alt="item thumb">
      <div class="item-details">
        <div class="item-title">${data.Name}</div>
        <div class="item-place">${data.Place}</div>
      </div>
      <div class="item-delete">
        <i class="material-icons" data-id="${id}">delete_outline</i>
      </div>
    </div>
  `;

  items.innerHTML += html;

  }
};

const removeItem = (id) =>{
  const item = document.querySelector(`.item[data-id='${id}']`)
  item.remove();
}

//force-refresh the list display
const RenderAllItems = (id) =>{
  if(strIsEmpty(id, 1)) return;
  //reset items
  items.innerHTML = "";
  //get db collection
  const ref = db.collection("ShoppingItem");
  //query against collection and select only the items that belong to the list with the given id
  var query = ref.where("ListID", "==", id)
  .get()
  .then( (qSnap) =>{
    qSnap.forEach( (doc) =>{
      renderItem(doc.data(), doc.id);
    });
  })
  .catch( (err) =>{
    console.log(err);
  });
};

const renderList = (data, id) =>{
  const html = `<li class = "list" data-id="${id}"><a data-id="${id}" href="#" class="waves-effect">${data.Name}</a></li>`
  lists.innerHTML += html;
}

const removeList = (id) =>{
  const list = document.querySelector(`.list[data-id='${id}']`)
  list.remove();
}

const setListContainerAndItemAddForm = (id, titleHTML, formHTML) =>{

  const fAddItem = document.querySelector('.add-item');
  const sListTitle = document.querySelector('#ShoppingListTitle');
  const sListTitleID = sListTitle.getAttribute('data-id').toString();

  if(sListTitleID === id) return;//do not force reload what's loaded already

  //disable button when no id is present, else enable
  const button = document.querySelector(".listDelete");
  if(strIsEmpty(id, 1)){
    button.style.display =  "none";
  }
  else{
    button.style.display = "block";
  }

  fAddItem.setAttribute('data-id', id);
  fAddItem.querySelector('h6').innerHTML = formHTML;
  
  sListTitle.innerHTML = titleHTML;
  sListTitle.setAttribute('data-id', id);

  RenderAllItems(id);
}

//#endregion

//----------------------------------------------
//#region UI interactivity

//makes nav clickable
document.addEventListener('DOMContentLoaded', function() {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  // add item form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left'});
});

//when a list is selected its id is sent to the form and to the title and the delete button becomes available
const listContainer = document.querySelector('#side-menu');
listContainer.addEventListener('click', evt =>{

  if(evt.target.tagName === 'A'){
      const id = evt.target.getAttribute('data-id').toString();

      const titleHTML = evt.target.innerHTML;
      const formHTML = 'New Item for <span>' + titleHTML + '</span>'

      setListContainerAndItemAddForm(id, titleHTML, formHTML);

    }
  }
);

//#endregion 


