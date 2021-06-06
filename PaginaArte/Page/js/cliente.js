function validarRegistro(){
    let nombre = document.querySelector("#nombre").value;
    let apellido = document.querySelector("#apellido").value;
    let email = document.querySelector("#email").value;
    let pass = document.querySelector("#psw").value;
    let edad = document.querySelector("#edad").value;
    let rol = document.querySelector("#rol").value
    let descripcion = document.querySelector("#descripcionUser").value
    let foto = document.getElementById("fotoPerfil")

    let ok = true;

    console.log(foto.files);

    if(nombre == ""){
        alert("Rellene el campo nombre");
        ok = false;
    }
    if(apellido == ""){
        alert("Rellene el campo apellido");
        ok = false;
    }
    if(email == ""){
        alert("Rellene el campo email");
        ok = false;
    }
    if(pass == ""){
        alert("Rellene el campo pass");
        ok = false;
    }
    if(edad == ""){
        alert("Rellene el campo edad");
        ok = false;
    }
    if(foto.files.length == 0){
        alert("Ponga su foto de perfil para continuar");
        ok = false;
    }
    if(descripcion == ""){
        alert("Rellena tu descripcion");
        ok = false;
    }
    let user = new FormData();
    user.append("nombre",nombre)
    user.append("apellido",apellido)
    user.append("email",email)
    user.append("password",pass)
    user.append("edad",edad)
    user.append("descripcion",descripcion)
    user.append("imagen",foto.files[0])

    if(ok){
        if(rol == 1){
            user.append('rol', "espectador")
        }else{
            user.append('rol', "artista")
        }
        registroUsuario(user)
    }
}

function validarLogin(){
    let email = document.querySelector("#emailL").value;
    let pass = document.querySelector("#pswL").value;

    let ok = true;

    if(email == ""){
        alert("Rellene el campo email");
        ok = false;
    }
    if(pass == ""){
        alert("Rellene el campo pass");
        ok = false;
    }
    let user = {
        email : email,
        password : pass,
    }
    if(ok){
        LoginUsuario(user)
    }
}

async function registroUsuario(user){
    try{
        let response = await fetch('http://localhost:3000/insertUser',{
            method:	'POST',
            body: user,
        })
        location.href = "login.html"
        console.log(response)
    }catch(e){
        alert('Error en la base de datos')
    }

}

async function LoginUsuario(user){
    try{
        let response = await fetch('http://localhost:3000/loginUser',{
            method:	'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(user),
        })
        if(response.status == 200){
            
            let user = await response.json()
            localStorage.setItem("user", JSON.stringify(user.user[0]))
            location.href = "index.html"

        }else if(response.status == 401){ 
            alert('Correo o contraseña incorrectos')
            console.log(await response.json())
        }
    }catch(e){
        //alert('Error en la base de datos')
        console.log(e)
    }

}

function logOut(){
    localStorage.removeItem('user')
    location.href = "/login.html"
}

function goToProfile(){
    let dataUser = localStorage.getItem('user')
    dataUser = JSON.parse(dataUser)
    let rol = dataUser.rol
    console.log(rol)

    if(rol === "espectador"){
        location.href = "/profilenormal.html"
    }else if(rol === "artista"){
        location.href = "/profile.html"
    }
}

async function loadArt(){
    try{
        let response = await fetch('http://localhost:3000/getObras',{
            method:	'GET',
            headers:{
                'Content-Type' : 'application/json'
            },
        })
        let cardsContainer = document.getElementById('cardss')
        let data = await response.json()
    
        console.log(data)
        console.log(cardsContainer)

        cardsContainer.innerHTML = ""

        for(let i = 0; i <data.length; i++){
            console.log(data[i].id)
            let idImg = `http://localhost:3000/getObraFoto/${data[i].id}`
            cardsContainer.innerHTML += `
            <div class="col-4 col-12-medium">
    
                <section class="box feature" id="${data[i].id}" onclick="sendPost(this)">
                    <a href="#" class="image featured" style="cursor: pointer;"><img src="${idImg}" alt="" /></a>
                    <div class="inner">
                        <header>
                            <h2>${data[i].nombre}</h2>
                            <p>Maquilladora Profesional</p>
                        </header>
                        <p>${data[i].descripcion}</p>
                    </div>
                </section>
    
            </div>
            `

        }
        closeConnection()
    }catch(e){
        alert('Error en la base de datos')
        console.log(e)
    }

}

async function loadExplore(){
    try{
        let response = await fetch('http://localhost:3000/getObras',{
            method:	'GET',
            headers:{
                'Content-Type' : 'application/json'
            },
        })
        let cardsContainer = document.getElementById('exploreContainer')
        let data = await response.json()
    
        console.log(data)
        console.log(cardsContainer)

        cardsContainer.innerHTML = ""

        for(let i = 0; i <data.length; i++){
            console.log(data[i].id)
            let idImg = `http://localhost:3000/getObraFoto/${data[i].id}`
            cardsContainer.innerHTML += `
            <div class="col-md-4 text-center animate-box" >
                <a class="work" id="${data[i].id}" onclick="sendPost(this)">
                    <div class="work-grid" style="background-image:url(${idImg});">
                        <div class="inner">
                            <div class="desc">
                            <h3>${data[i].nombreExplore}</h3>
                            <span class="cat">${data[i].categoria}</span>
                        </div>
                        </div>
                    </div>
                </a>
            </div>
            `

        }
        closeConnection()
    }catch(e){
        alert('Error en la base de datos')
        console.log(e)
    }

}

function sendPost(obj){
    localStorage.setItem('postActive', JSON.stringify(obj.id))
    location.href = 'post.html'
}

async function loadPost(){
    let containerPost = document.getElementById("contentPost")
    let idPost = localStorage.getItem('postActive')
    let user = localStorage.getItem('user')
    user = JSON.parse(user)
    let userRol = user.rol
    
    let response = await fetch(`http://localhost:3000/getObra/${JSON.parse(idPost)}`,{
        method:	'GET',
        headers:{
            'Content-Type' : 'application/json'
        },
    })

    let data = await response.json()
    let urlImg = `http://localhost:3000/getObraFoto/${data.id}`

    console.log(data)

    containerPost.innerHTML =""
    containerPost.innerHTML =`
        <article >

            <h2>Post </h2>
            
            <img src="${urlImg}" alt="Italian Trulli" style="text-align: center; width:50%; height:auto" class="center">
            
            <br>
            
            <h2>By: ${"" + data.user.nombre + " " + data.user.apellido}</h2>
            
            <br>

            <p>${data.descripcion}</p>

        </article>
    `
    if(userRol === "espectador"){
        containerPost.innerHTML +=`
            <button style="color: white;" onclick="goToBuy()" >Comprar</button>
        `
    }
    
    closeConnection()
}

function goToBuy(){
    location.href="factura.html"
}

async function loadFacture(){
    let factura = document.getElementById("main-wrapperP")
    
    let user = localStorage.getItem("user")
    let idProduct = localStorage.getItem("postActive")
    user = JSON.parse(user)
    idProduct = JSON.parse(idProduct)

    let response = await fetch(`http://localhost:3000/getObra/${idProduct}`,{
        method:	'GET',
        headers:{
            'Content-Type' : 'application/json'
        },
    })

    let data = await response.json()
    let urlImg = `http://localhost:3000/getObraFoto/${data.id}`

    console.log(data)
    factura.innerHTML = ""
    factura.innerHTML += `
    <div class="container">
        <div class="row gtr-200">
            <div class="col-8 col-12-medium">
                <div id="content">
                    <!-- Content -->
                        <article>
                            <h2>Producto: ${data.nombreExplore}</h2>
                            <img src="${urlImg}" alt="Italian Trulli" style="text-align: center; width:50%; height:auto" class="center">
                            <br>
                            <p>${data.descripcion}</p>

                        </article>

                </div>
            </div>
            <div class="col-4 col-12-medium">
                <div id="sidebar">

                    <!-- Sidebar -->
                        <section>
                            <h3>Términos</h3>
                            <p>Usted acepta la compra de este producto y los térinos individuales del artista o vendedor</p>
                            
                            <section>
                            <h3>Precio</h3>
                            <ul class="style2">
                                <li><a href="#">Producto......$${data.precio}.00</a></li>
                                <li><a href="#">Shipping......$10.00</a></li>
                            </ul>
                        </section>
                            
                            <footer>
                                <a class="button" onclick="buyArt(${user.id},${idProduct})">Comprar</a>
                            </footer>
                        </section>
                </div>
            </div>
        </div>
    </div>
    
    `
    closeConnection();
}

async function buyArt(idUser, idProduct){
    console.log(idUser)
    console.log(idProduct)

    let obj = {
        fkUser: idUser,
        fkObra: idProduct
    }

    let response = await fetch('http://localhost:3000/setObraUser',{
        method:	'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(obj),
    })
    if(response.status == 200){
        alert('Se ha realizado con exito la compra')
    }
    location.href = "index.html"
    console.log(response)
}


async function loadProfileArtist(){
    let dataUser = localStorage.getItem('user')
    dataUser = JSON.parse(dataUser)

    let profileContainer = document.getElementById("profileSpace")
    let postContainer = document.getElementById("postSpace")

    let urlImgUser = `http://localhost:3000/getUserImage/${dataUser.id}`


    profileContainer.innerHTML =""
    profileContainer.innerHTML = `
    
    <div class="author-inner animate-box" style="background-image: url(${urlImgUser});">
    </div>
    <div class="desc animate-box">
        <span>Artista</span>
        <h3>${"" + dataUser.nombre +" " +dataUser.apellido}</h3>
        <p>${dataUser.descripcion}</p>
        
        <ul class="fh5co-social-icons">
            <li><a href="#"><i class="icon-facebook"></i></a></li>
            <li><a href="#"><i class="icon-twitter"></i></a></li>
            <li><a href="#"><i class="icon-dribbble"></i></a></li>
            <li><a href="#"><i class="icon-github"></i></a></li>
        </ul>
        <br><button type="submit" class="button" style="color: #fff" onclick="goToCreatePost()"><a >Crear Post</a></button>
    </div>
    
    `

    let response2 = await fetch(`http://localhost:3000/getUserObra/${dataUser.id}`,{
        method:	'GET',
        headers:{
            'Content-Type' : 'application/json'
        },
    })

    let dataPosts = await response2.json()
    console.log(dataPosts.obras)
    postContainer.innerHTML = ""
    for(let i=0; i < dataPosts.obras.length; i++){
        let urlImg = `http://localhost:3000/getObraFoto/${dataPosts.obras[i].id}`
        postContainer.innerHTML += `
        <div class="col-4 col-12-medium">
            <!-- Box -->
                <section class="box feature">
                    <a href="post00.html" class="image featured"><img src="${urlImg}" alt="" /></a>
                </section>
    
        </div>
        `
    }

}

async function loadProfileNormal(){
    let dataUser = localStorage.getItem('user')
    dataUser = JSON.parse(dataUser)

    let urlImgUser = `http://localhost:3000/getUserImage/${dataUser.id}`

    let profileContainer = document.getElementById("profileSpaceC")
    let postContainer = document.getElementById("postSpaceC")

    profileContainer.innerHTML =""
    profileContainer.innerHTML = `
    
    <div class="author">
        <div class="author-inner animate-box" style="background-image: url(${urlImgUser});">
        </div>
        <div class="desc animate-box">
            <span>Espectadora y compradora</span>
            <h3>${"" + dataUser.nombre +" " +dataUser.apellido}</h3>
            <p>${dataUser.descripcion}</p>
            
        </div>
    </div>
    
    `
    let response2 = await fetch(`http://localhost:3000/getUserObra/${dataUser.id}`,{
        method:	'GET',
        headers:{
            'Content-Type' : 'application/json'
        },
    })

    let dataPosts = await response2.json()
    console.log(dataPosts.obras)
    postContainer.innerHTML = ""

    for(let i=0; i < dataPosts.obras.length; i++){
        let urlImg = `http://localhost:3000/getObraFoto/${dataPosts.obras[i].id}`
        postContainer.innerHTML += `
        <div class="col-4 col-12-medium">
            <!-- Box -->
                <section class="box feature">
                    <a href="post00.html" class="image featured"><img src="${urlImg}" alt="" /></a>
                </section>
    
        </div>
        `
    }
}


function goToCreatePost(){
    location.href = "crearpost.html"
}

function validarPost(){
    let nombreImg = document.querySelector("#nombreImg").value;
    let nombrePost = document.querySelector("#nombrePost").value;
    let descripcion = document.querySelector("#descripcionPost").value;
    let categoria = document.querySelector("#categoriaPost").value;
    let precio = document.querySelector("#precioPost").value;
    let foto = document.getElementById("imagePostC")

    let user = localStorage.getItem('user')
    user = JSON.parse(user)

    let ok = true;

    console.log(foto.files);

    if(nombreImg == ""){
        alert("Rellene el campo nombre de la imagen");
        ok = false;
    }
    if(nombrePost == ""){
        alert("Rellene el campo nombre post");
        ok = false;
    }
    if(precio == ""){
        alert("Rellene el campo precio");
        ok = false;
    }
    if(categoria == ""){
        alert("Rellene el campo categoria");
        ok = false;
    }
    if(foto.files.length == 0){
        alert("Ponga su foto de perfil para continuar");
        ok = false;
    }
    if(descripcion == ""){
        alert("Rellena tu descripcion");
        ok = false;
    }
    let post = new FormData();
    post.append("nombre",nombrePost)
    post.append("nombreExplore",nombreImg)
    post.append("precio",precio)
    post.append("categoria",categoria)
    post.append("descripcion",descripcion)
    post.append("imagen",foto.files[0])
    post.append("userId", user.id)

    if(ok){
        registrarPost(post)
    }
    
}

async function registrarPost(post){
    try{
        let response = await fetch('http://localhost:3000/insertPost',{
            method:	'POST',
            body: post,
        })
        goToProfile()
        console.log(response)
    }catch(e){
        alert('Error en la base de datos')
    }
}

async function closeConnection(){
    let response = await fetch('http://localhost:3000/finaly',{
        method:	'GET',
        headers:{
            'Content-Type' : 'application/json'
        },
    })
    console.log(response)
}

