var server = "http://localhost:8123";
var jsonresponse
var userName;
var allarticles
var currentArticle;
var allpictures;
var userName = null;
const readerRole = "reader";
const adminRole = "admin";
var delArticles
var delCat

//Получить дерево категорий и статей, вынести всё в drop-down меню
function getTree() {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //alert(xmlhttp.responseText);
      jsonresponse = JSON.parse(xmlhttp.responseText);
      tree = jsonresponse;
      throughTree(0, tree);
      $(document).ready(function () {
        $('.dropdown a.test').on("click", function (e) {
          $(this).next('ul').toggle();
          e.stopPropagation();
          e.preventDefault();
        });
      });
      document.querySelector('.btn.btn-default.dropdown-toggle').disabled = false;
      //addNewList(1,"addedByJS");

      //addNewList("test1","menu1","menu2")
    }
  };
  xmlhttp.open("GET", server + "/catTree", true);
  xmlhttp.send();
  
}

//Запросить все статьи и занести их в стартовую страницу
function getMainArticles() {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      allarticles = JSON.parse(xmlhttp.responseText);
      setArticles();
    }
  };
  xmlhttp.open("GET", server + "/init", true);
  xmlhttp.send();
}

//Вынести дерево в dropdown меню
function throughTree(level, JSONarray) {
  for (let i = 0; i < JSONarray.length; i += 1) {
    var parentid = level == 0 ? "menu" : JSONarray[i]["category"].parentid;
    var currentid = JSONarray[i]["category"].id;
    addNewList(JSONarray[i]["category"].name, parentid, currentid);
    addArticleOnList(JSONarray[i].articles);
    if (JSONarray[i].childs !== null) {
      throughTree(level + 1, JSONarray[i].childs);
    } else {
      addButtons(currentid);
    }
    if (i === JSONarray.length - 1) {
      addButtons(parentid);
    }
  }
}

//Отобразить новую категорию в меню
function addNewList(name, idParent, idChild) {
  if (idParent === "null" || idParent==="") {
    idParent = "menu";
  }
  var dropdown = document.getElementById(idParent);
  var Li = document.createElement("li");
  var elA = document.createElement("a");
  var elSpan = document.createElement("span");
  var elementUL = document.createElement("ul");
  let DelBtn = document.createElement("button");
  elSpan.classList.add("caret");
  elA.href = "#";
  elA.tabIndex = "-1";
  elA.classList.add("test");
  elA.classList.add("category");
  elA.textContent = name;
  elementUL.classList.add("dropdown-menu");
  elementUL.id = idChild;
  elA.appendChild(elSpan);
  DelBtn.classList.add("delBtn");
  DelBtn.classList.add("btn");
  DelBtn.onclick = deleteCat;
  DelBtn.innerText = "Del";
  let role = localStorage.getItem("role");
  if (role === null || role === readerRole)
    DelBtn.classList.add("hidden");
  Li.appendChild(elA);
  Li.appendChild(elementUL);
  Li.appendChild(DelBtn);
  dropdown.insertBefore(Li, dropdown.childNodes[0]);
}

function deleteCat(event) {
  delArticles = new Array();
  delCat = new Array();
  let catId = event.target.parentElement.children[1].id;
  let articles = document.getElementById(catId).querySelectorAll(".article");
  let cat = document.getElementById(catId).querySelectorAll(".category");
  for (let i = 0; i < articles.length; i++) {
    del(articles[i].parentElement.id);
  }
  for (let i = 0; i < cat.length; i++) {
    delCat.push({
      id: cat[i].parentElement.children[1].id,
      name: "",
      parentid: ""
    });
  }
  delCat.push({
    id: catId,
    name: "",
    parentid: ""
  });
  sentCatToDel(delCat);
  parent = event.target.parentElement.parentElement;
  parent.removeChild(event.target.parentElement);
  // var cat = findCat(catId, tree);
  // document.removeChild(document.getElementById(catId));

  // sentArtToDel(delArticles);
  // sentCatToDel(delCat);
}

function sentCatToDel(categories) {
  let xmlhttp = new XMLHttpRequest();
  let string = server + "/deleteCats";
  xmlhttp.open("POST", string, true);
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {}
  }
  xmlhttp.setRequestHeader("token", localStorage.getItem("tokenArticles"));
  xmlhttp.send(JSON.stringify(
    categories
  ));
}

//Отобразить статьи в категории
function addArticleOnList(articles) {
  if (articles === null)
    return;
  for (i = 0; i < articles.length; i += 1) {
    let categoryid = articles[i].catid === "null" ? "menu" : articles[i].catid;
    var dropdown = document.getElementById(categoryid);
    var Li = document.createElement("li");
    var elA = document.createElement("a");
    let DelBtn = document.createElement("button");
    Li.id = articles[i].id;
    /*elA.onclick=(e)=>{
      console.log(e.target.parentElement.id+" was clicked");
    };*/
    elA.onclick = goToArticle;
    elA.href = "#";
    elA.tabIndex = "-1";
    elA.classList.add("test");
    elA.classList.add("article");
    elA.textContent = articles[i].header;
    DelBtn.classList.add("delBtn");
    DelBtn.classList.add("btn");
    DelBtn.innerText = "Del";
    DelBtn.onclick = deleteArt;
    let role = localStorage.getItem("role");
    if (role === null || role === readerRole)
      DelBtn.classList.add("hidden");
    Li.appendChild(elA);
    Li.appendChild(DelBtn);
    dropdown.insertBefore(Li, dropdown.childNodes[dropdown.childNodes.length - 1]);
    /*if (dropdown.childElementCount >= 4 && dropdown.lastElementChild.childElementCount > 1)
      dropdown.insertBefore(Li, dropdown.childNodes[dropdown.childElementCount]);
    else
      dropdown.appendChild(Li);*/
  }
}

function deleteArt(event) {
  del(event.target.parentElement.id)
}

function delFromMainPage(event) {
  curid = event.target.parentElement.children[1].id;
  let elemt = document.getElementById(curid)
  elemt.parentElement.removeChild(elemt);
  if (document.getElementById(curid) !== null) {
    document.getElementById(curid).parentElement.parentElement.removeChild(document.getElementById(curid).parentElement);
    for (let i = 0; i < allarticles.length; i++) {
      let element = allarticles[i];
      if (element.id === curid) {
        allarticles = allarticles.filter(function (item) {
          return item.id !== element.id
        })
        sentArtToDel([element]);
        break;
      }
    }
  }
  else
  {
    sentArtToDel([{id:curid,pic:"",header:"",content:"",catid:"",views:0}]);
  }
  /*if (currentArticle !== null && currentArticle!==undefined && currentArticle.id === curid) {
    changeMainPage();
  }*/
}

function del(curid) {
  let elemt = document.getElementById(curid)
  elemt.parentElement.removeChild(elemt);
  if (document.getElementById(curid) !== null) {
    document.getElementById(curid).parentElement.removeChild(document.getElementById(curid));
    for (let i = 0; i < allarticles.length; i++) {
      let element = allarticles[i];
      if (element.id === curid) {
        allarticles = allarticles.filter(function (item) {
          return item.id !== element.id
        })
        sentArtToDel([element]);
        break;
      }
    }
  }
  else
  {
    sentArtToDel([{id:curid,pic:"",header:"",content:"",catid:"",views:0}]);
  }
  if (currentArticle !== null && currentArticle!==undefined && currentArticle.id === curid) {
    changeMainPage();
    ChangeButtonName();
  }
}

function sentArtToDel(articles) {
  let xmlhttp = new XMLHttpRequest();
  let string = server + "/deleteArts";
  xmlhttp.open("POST", string, true);
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {}
  }
  xmlhttp.setRequestHeader("token", localStorage.getItem("tokenArticles"));
  xmlhttp.send(JSON.stringify(
    articles
  ));
}

//Добавление кнопок для добавления статей и категорий
function addButtons(parentid) {
  var dropdown = document.getElementById(parentid);
  var Li = document.createElement("li");
  //var elA = document.createElement("a");
  var catButton = document.createElement("button");
  var artButton = document.createElement("button");
  var articleForm = document.createElement("form");
  var categoryForm = document.createElement("form");
  var articleNameInput = document.createElement("input");
  var CategoryNameInput = document.createElement("input");
  catButton.innerText = "Категория";
  artButton.innerText = "Статья";
  artButton.type = "button";
  catButton.type = "button";
  articleNameInput.name = "art";
  //artButton.type = "submit";
  artButton.onclick = addNewArticle
  articleForm.appendChild(articleNameInput);
  articleForm.appendChild(artButton);
  articleForm.classList.add("addition-form");

  CategoryNameInput.name = "cat";
  catButton.onclick = addNewCategory;
  categoryForm.appendChild(CategoryNameInput);
  categoryForm.appendChild(catButton);
  categoryForm.classList.add("addition-form");

  Li.appendChild(categoryForm);
  Li.appendChild(articleForm);
  Li.classList.add("liButtons");
  let role = localStorage.getItem("role");
  if (role === null || role === readerRole) {
    Li.classList.add("hidden");
  }
  dropdown.appendChild(Li);
}

function buttonsForRole(role) {
  if (role === null || role === readerRole) {
    let forms = document.querySelectorAll(".addition-form");
    forms.forEach(element => {
      if (!element.parentElement.classList.contains("hidden")) {
        element.parentElement.classList.add("hidden");
      }
    });
    forms = document.querySelectorAll(".delBtn");
    forms.forEach(element => {
      /*if (!element.parentElement.classList.contains("hidden")) {
        element.parentElement.classList.add("hidden");
      }*/
      if (!element.classList.contains("hidden")) {
        element.classList.add("hidden");
      }
    });
    forms = document.querySelectorAll(".fa-times");
    forms.forEach(element => {
      if (!element.classList.contains("hidden")) {
        element.classList.add("hidden");
      }
    });
  }
  if (role === adminRole) {
    let forms = document.querySelectorAll(".addition-form");
    forms.forEach(element => {
      if (element.parentElement.classList.contains("hidden")) {
        element.parentElement.classList.remove("hidden");
      }
    });
    forms = document.querySelectorAll(".delBtn");
    forms.forEach(element => {
      if (element.parentElement.classList.contains("hidden")) {
        element.parentElement.classList.remove("hidden");
      }
      if (element.classList.contains("hidden")) {
        element.classList.remove("hidden");
      }
    });
    forms = document.querySelectorAll(".fa-times");
    forms.forEach(element => {
      if (element.classList.contains("hidden")) {
        element.classList.remove("hidden");
      }
    });
  }
}

//Отдать название новой статьи по id категории, получить статью
function addNewArticle(event) {
  if (localStorage.getItem("tokenArticles") === null) {
    alert("Войдите в систему");
    return;
  }
  if (event.target.parentElement.children[0].value === "") {
    alert("Введите имя");
    return;
  }
  let catid = null
  if (event.target.parentElement.parentElement.parentElement.id !== "menu")
    catid = event.target.parentElement.parentElement.parentElement.id;
  var string = server + "/" + catid + "/article/create";
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", string, true);
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let article = JSON.parse(xmlhttp.responseText)
      addArticleOnList([article]);
      articlePage(article);
    }
  }
  xmlhttp.setRequestHeader("token", localStorage.getItem("tokenArticles"));
  xmlhttp.send(JSON.stringify({
    art: event.target.parentElement.children[0].value
  }));

  /*var url = server + "/" + "e46c203e-f701-11e8-a8a5-bcaec5906742" + "/article/create";
  let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST",url,true);
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
            alert("Message sended!");
        }
    }
    xmlhttp.send(JSON.stringify({art: event.target.parentElement.children[0].value}));*/

}

// Отдать название новой категории, по id категории НЕ ПРОВЕРЕНО
function addNewCategory(event) {
  if (localStorage.getItem("tokenArticles") === null) {
    alert("Войдите в систему");
    return;
  }
  if (event.target.parentElement.children[0].value === "") {
    alert("Введите имя");
    return;
  }
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      jsonobj = JSON.parse(xmlhttp.responseText)
      addNewList(jsonobj.name, jsonobj.parentid, jsonobj.id);
      $('.dropdown a.test').on("click", function (e) {
        $(this).next('ul').toggle();
        e.stopPropagation();
        e.preventDefault();
      });
      let elem = document.getElementById(jsonobj.id)
      if (elem.childNodes.length === 0)
        addButtons(jsonobj.id);
    }
  }
  catid = null
  if (event.target.parentElement.parentElement.parentElement.id !== "menu")
    catid = event.target.parentElement.parentElement.parentElement.id;
  xmlhttp.open("POST", server + "/" + catid + "/create", true);
  xmlhttp.setRequestHeader("token", localStorage.getItem("tokenArticles"));
  xmlhttp.send(JSON.stringify({
    cat: event.target.parentElement.children[0].value
  }));
}

//ПЕРЕХОД НА СТРАНИЦУ СО СТАТЬЁЙ
function goToArticle(event) { //
  articleId = event.target.parentElement.id;
  let article;
  for (let i = 0; i < allarticles.length; i++) {
    if (allarticles[i].id === articleId) {
      article = allarticles[i];
      break;
    }
  }
  articlePage(article);
}

//Добавляет все статьи на главную страницу
function setArticles() {
  let main = document.getElementById("allArticles");
  allpictures = new Array();
  main.innerText = "";
  main.innerHTML = "";
  for (i = 0; i < allarticles.length; i++) {
    addArticleInPage(allarticles[i]);
  }
}

function goToArticleFromPage(event) {
  let target = event.target;
  while (target.id === "") {
    target = target.parentElement;
  }

  let article;
  for (let i = 0; i < allarticles.length; i++) {
    if (allarticles[i].id === target.id) {
      article = allarticles[i];
      break;
    }
  }
  articlePage(article);
}

//Отображает статью
function articlePage(article) {
  if (document.getElementById("back").innerText === "Refresh")
    ChangeButtonName();
  currentArticle = article;
  if (!document.getElementById("allArticles").classList.contains("hidden")) {
    changeMainPage();
  }
  if (document.getElementById("constHeader").classList.contains("hidden")) {
    changeArticle(null);
  }
  let role = localStorage.getItem("role");
  if (role ===null || role===readerRole)
    showChange(false);
  if(role===adminRole)
    showChange(true);
  
  let file = document.getElementById("file");
  file.value = "";
  let articlePage = document.getElementById("articlePage");
  document.getElementById("constHeader").textContent = article.header;
  let content = document.getElementById("constContent").querySelector(".art-container_cont-text")
  content.innerText = article.content;
  let image = articlePage.querySelector(".art-container_cont-image");
  if (article.picture !== null && article.picture !== "" && article.picture !== undefined) {
    image.src = getPictureSrc(article.picture);
  } else {
    image.src = "";
  }
  let hiddenContent = document.getElementById("Content").querySelector(".art-container_cont-text");
  hiddenContent.value = article.content;
  let hiddenHeader = document.getElementById("Header");
  hiddenHeader.value = article.header;
  //image.src = article.image;
}

function showChange(bool){
  if(bool ===true){
    if(document.getElementById("changebtn").classList.contains("hidden"))
      document.getElementById("changebtn").classList.remove("hidden");
  }
  else
  {
    if(!document.getElementById("changebtn").classList.contains("hidden"))
    {
      document.getElementById("changebtn").classList.add("hidden");
    }
  }
}

function getPictureSrc(string) {
  let res = charToString(string);
  res = "data:image/jpeg;base64," + res;
  return res;
}

function changeMainPage() {
  let main = document.getElementById("allArticles");
  let articlePage = document.getElementById("articlePage");
  let search = document.querySelector(".nav.navbar-nav.navbar-right");
  if (search.classList.contains("hidden")) {
    search.classList.remove("hidden");
  } else {
    search.classList.add("hidden");
  }
  changeVision(main, articlePage);
  // if (main.classList.contains("hidden")){
  //   main.classList.remove("hidden");
  //   articlePage.classList.add("hidden");
  // }
  // else
  // {
  //   articlePage.classList.remove("hidden");
  //   main.classList.add("hidden");
  // }
}

//Добавляет новую статью на главную страницу
function addArticleInPage(article) {
  let columnandbutton = document.createElement("div");
  columnandbutton.classList.add("col-sm-4");
  let main = document.getElementById("allArticles");
  var column = document.createElement("div");
  var icon = document.createElement("i");
  //column.classList.add("col-sm-4");
  column.onclick = goToArticleFromPage;
  column.id = article.id;
  var panel = document.createElement("div");
  panel.classList.add("panel");
  panel.classList.add("panel-primary");
  var header = document.createElement("div");
  header.classList.add("panel-heading");
  icon.classList.add("fa");
  icon.classList.add("fa-times");
  let role = localStorage.getItem("role");
  if(role === null || role ===readerRole)
    icon.classList.add("hidden");
  icon.onclick = delFromMainPage;
  //column.appendChild(icon);
  var imgDiv = document.createElement("div");
  imgDiv.classList.add("panel-body");
  var footer = document.createElement("div");
  footer.classList.add("panel-footer");
  var myImg = document.createElement("img");
  myImg.classList.add("img-responsive");
  myImg.style = "width:100%";
  myImg.alt = "Image";
  header.innerText = article.header;
  footer.innerText = article.content.substring(0, 25) + "...";
  if (article.picture !== null && article.picture !== "" && article.picture !== undefined)
    myImg.src = getPictureSrc(article.picture);
  imgDiv.appendChild(myImg);
  panel.appendChild(header);
  panel.appendChild(imgDiv);
  panel.appendChild(footer);
  column.appendChild(panel);
  columnandbutton.appendChild(icon);
  columnandbutton.appendChild(column);
  main.appendChild(columnandbutton);
}

//Поиск при вводе
function searchOnInput(event) {
  let main = document.getElementById("allArticles");
  main.innerText = "";
  main.innerHTML = "";
  if (event.target.value === "") {
    setArticles();
    return;
  }
  for (i = 0; i < allarticles.length; i++) {
    if (allarticles[i].content.includes(event.target.value) || allarticles[i].header.includes(event.target.value)) {
      addArticleInPage(allarticles[i]);
    }
  }
}

//Отправляет хешированные логин и пароль, получет токен пользователя
function login(event) {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", server + "/login", true);
  log = document.getElementById("log");
  pswd = document.getElementById("pswd");
  userName = log.value;
  let hasher = new jsSHA("SHA-512", "TEXT");
  hasher.update(log.value);
  let hashLog = hasher.getHash("B64");
  hasher = new jsSHA("SHA-512", "TEXT");
  hasher.update(pswd.value);
  let hashpass = hasher.getHash("B64");

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      jsonobj = JSON.parse(xmlhttp.responseText);
      localStorage.setItem("tokenArticles", jsonobj["token"]);
      localStorage.setItem("role", jsonobj["role"]);
      changeLoginForms();
      setName(userName);
      buttonsForRole(localStorage.getItem("role"));
      if(document.getElementById("allArticles").classList.contains("hidden")){
        showChange(true);
      }
    }
  }
  xmlhttp.send(JSON.stringify({
    login: hashLog,
    pass: hashpass
  }));
}

function VKRegistration() {
  VK.Observer.subscribe('auth.login', function (response) {
    if (response.session) {
      getToken();
      changeLoginForms();
      setName(response.session.user.first_name)

    }
  });
  VK.Auth.login(null);
}

function getToken() {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let token = JSON.parse(xmlhttp.responseText);
      localStorage.setItem("tokenArticles", token.token);
      localStorage.setItem("role", token.role);
    };
  }
  xmlhttp.open("GET", server + "/token", true);
  xmlhttp.send();
}

//Создаёт нового пользователя, отправляя хешированные логин и пароль, получет токен пользователя
function registration(event) {
  log = document.getElementById("log");
  pswd = document.getElementById("pswd");
  userName = log.value;
  let hasher = new jsSHA("SHA-512", "TEXT");
  hasher.update(log.value);
  let hashLog = hasher.getHash("B64");
  hasher = new jsSHA("SHA-512", "TEXT");
  hasher.update(pswd.value);
  let hashpass = hasher.getHash("B64");
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      jsonobj = JSON.parse(xmlhttp.responseText);
      localStorage.setItem("tokenArticles", jsonobj["token"]);
      changeLoginForms();
      setName(userName);
      buttonsForRole(localStorage.getItem("role"));
    }
  }
  xmlhttp.open("POST", server + "/reg", true);
  xmlhttp.send(JSON.stringify({
    login: hashLog,
    pass: hashpass
  }));
}

function setName(name) {
  let profile = document.getElementById("profile").children[0];
  profile.innerText = name;
}

function changeVision(first, second) {
  if (first.classList.contains("hidden")) {
    first.classList.remove("hidden");
    second.classList.add("hidden");
  } else {
    first.classList.add("hidden");
    second.classList.remove("hidden");
  }
}

//Меняет отображение верхнего меню (Форма входа, на форму профиля и наоборот)
function changeLoginForms() {
  let logForm = document.getElementById("login")
  let profForm = document.getElementById("profile");
  changeVision(logForm, profForm);
  /*if(logForm.classList.contains("hidden")){
    logForm.classList.remove("hidden");
    profForm.classList.add("hidden");
  }
  else
  {
    logForm.classList.add("hidden");
    profForm.classList.remove("hidden");
  }*/
}

//Выходит из профиля, отправляя токен пользователя на сервер
function logout() {
  userName = null;
  VK.Auth.logout(function (response) {})
  if (localStorage.getItem("tokenArticles") === null)
    return;
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

    }
  }
  xmlhttp.open("POST", server + "/logout", true);
  xmlhttp.send(JSON.stringify({
    token: localStorage.getItem("tokenArticles"),
  }));
  changeLoginForms();
  localStorage.removeItem("tokenArticles");
  localStorage.removeItem("role");
  buttonsForRole(localStorage.getItem("role"));
  if(document.getElementById("allArticles").classList.contains("hidden")){
    showChange(false);
  }
  document.getElementById("pswd").value = "";

}

function changeArticle(event) {
  let first = document.getElementById("constHeader");
  let second = document.getElementById("Header");
  changeVision(first, second)
  first = document.getElementById("constContent");
  second = document.getElementById("Content");
  changeVision(first, second)
  /*first = document.getElementById("imagebtn");
  if (first.classList.contains("hidden"))
    first.classList.remove("hidden");
  else
    first.classList.add("hidden");*/
  first = document.getElementById("cancelbtn");
  if (first.classList.contains("hidden"))
    first.classList.remove("hidden");
  else
    first.classList.add("hidden");
  first = document.getElementById("fileform");
  if (first.classList.contains("hidden"))
    first.classList.remove("hidden");
  else
    first.classList.add("hidden");
  first = document.getElementById("savebtn");
  second = document.getElementById("changebtn");
  changeVision(first, second)
}

function saveArticle(event) {
  if (localStorage.getItem("tokenArticles") === null) {
    alert("Войдите в систему");
    return;
  }
  categoryId = currentArticle.catid;
  let header = document.getElementById("Header").value;
  let content = document.getElementById("Content").querySelector(".art-container_cont-text").value;
  currentArticle.header = header;
  currentArticle.content = content;
  document.getElementById("constContent").querySelector(".art-container_cont-text").innerText = content;
  document.getElementById("constHeader").textContent = header;
  let img = document.querySelector(".art-container_cont-image");
  currentArticle.picture = getPictureBytes(img.src);
  currentArticle.pic = img.name;
  changeArticle(null);
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {}
  }
  xmlhttp.open("POST", server + "/" + categoryId + "/article", true);
  xmlhttp.setRequestHeader("token", localStorage.getItem("tokenArticles"))
  xmlhttp.send(JSON.stringify(currentArticle));
  UpdateTree(currentArticle);
}

function getPictureBytes(string) {
  return string.substring("data:image/jpeg;base64,".length);
}

//Проверка 

function cancelSave(event) {
  /*changeArticle();
  let myImg = document.querySelector(".art-container_cont-image");
  if (currentArticle.picture !== null && currentArticle.picture !== "" && currentArticle.picture !== undefined)
    myImg.src = charToString(currentArticle.picture);
  else
    myImg.scr = "";
  if (currentArticle.pic !== null && currentArticle.pic !== "" && currentArticle.pic !== undefined)
    myImg.name = currentArticle.name;
  else
    myImg.name = "";*/
  articlePage(currentArticle);

}

function ChangeButtonName() {
  button = document.getElementById("back");
  if (button.innerText === "Back")
    button.innerText = "Refresh";
  else
    button.innerText = "Back";
}

function back(event) {

  if (document.getElementById("allArticles").classList.contains("hidden")) {
    changeMainPage();
    ChangeButtonName();
  }
  getMainArticles();
}

function UpdateTree(article) {
  let articles = document.getElementById("menu").querySelectorAll(".article");
  for (let i = 0; i < articles.length; i++) {
    if (article.id === articles[i].parentElement.id) {
      articles[i].textContent = article.header;
    }
  }
}

function strToCharCode(string) {
  result = new Array();
  for (let i = 0; i < string.length; i++) {
    result.push(string.charCodeAt(i));
  }
  return result;
}

function charToString(array) {
  result = [];
  for (let i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return array;
}

function exit() {
  logout();
}

function showPic(event) {
  if (event.target.readyState === 2) {
    var img = document.querySelector(".art-container_cont-image");
    img.src = event.target.result;
    img.name = file.name;
  }
}

element = document.getElementById("example-search-input")
element.oninput = searchOnInput;
element = document.querySelector("#entrebtn");
element.onclick = login;
element = document.querySelector("#regisbtn");
element.onclick = registration;
element = document.querySelector("#logoutbtn");
element.onclick = logout;
element = document.querySelector("#changebtn");
element.onclick = changeArticle;
element = document.querySelector("#savebtn");
element.onclick = saveArticle;
element = document.querySelector("#cancelbtn");
element.onclick = cancelSave;
/*element = document.querySelector("#imagebtn");
element.onclick = addImage;*/
element = document.querySelector("#back");
element.onclick = back;
element = document.querySelector("#vk");
element.onclick = VKRegistration;
window.onbeforeunload = exit;

var control = document.getElementById("file");
control.addEventListener("change", function (event) {
  var reader = new FileReader();
  reader.onload = showPic;
  file = this.files[0];
  data = [file.name, file.type, file.size];
  reader.readAsDataURL(file);
}, false);


getTree();
getMainArticles();
response = VK.Auth.getLoginStatus(function (response) {
  let e = response;
});

// VK.Observer.subscribe('auth.login', function(response){
//   changeLoginForms();
//   setName(response.user.first_name)
// });
// VK.Auth.login(null);