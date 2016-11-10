console.log('Loaded!');

var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    //create request object
    var request = new XMLHttpRequest();
    //capture response and store
    request.onreadystatechange = function (){
        if(request.readyState == XMLHttpRequest.DONE){
            if(request.status == 200){
                var names = request.responseText;
                names = JSON.parse(names);
                var list = '';
                for (var i = 0 ; i < names.length ; i++){
                    list=list + '<li>'+names[i]+'</li>';
                }
                var ul = document.getElementById('namelist');
                ul.innerHTML=list;
            }
        }  
    };
    //make request
    var nameInput = document.getElementById('name');
    var name = nameInput.value;
    request.open('GET', 'http://peacerebel.imad.hasura-app.io/submit-name?name=' + name, true);
    request.send(null);
};

var comment_submit = document.getElementById('submit_comment');
comment_submit.onclick = function(){
    var comments = new XMLHttpRequest();
    comments.onreadystatechange = function(){
        if(comments.readyState == XMLHttpRequest.DONE){
            if(comments.status == 200){
                function (form){
                    var name = form.name.value;
                    var email = form.email.value;
                    var comment_text = form.comment.value;
                    var article_id = form.articleid.value;
                } 
            }
        }
    }
}