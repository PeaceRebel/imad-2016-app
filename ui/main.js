var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    //create request object
    var request = new XMLHttpRequest();
    //capture response and store
    request.onreadystatechange = function (){
        if(request.readyState == XMLHttpRequest.DONE){
            if(request.status == 200){
               console.log('user logged in.');
               alert('Logged in successfully. :)');
            }
            else {
                if(request.status === 403){
                    alert('username/password incorrect!');
                }
                else if(request.status === 500){
                    alert('Something went wrong on the server.');
                }
            }
        }  
    };
    //make request
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(username);
    console.log(password);
    request.open('POST', 'http://peacerebel.imad.hasura-app.io/login', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));
};

