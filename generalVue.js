

var app = new Vue({
    el: '#app',
    data: {
    fullresponse:null,
    loading:true,    
    token: '',
    username: '',
    password: '',
    currentUserId: '',
    auth:false,
    role:'admin',
    option:'',
    success:{
      "type" : "",
      "status": false,
      "text": ""
    }
    },
    methods: {
    processLogin: function()
      {
        var self = this;
          var credentials= {
            "username" :this.username, 
            "password" : this.password
          };
         PostJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/login", credentials)
         .then(
          function(result) {
            self.fullresponse=(JSON.parse(result));
            self.auth=self.fullresponse.tokenValue?true:false;
            self.loading=false;
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
           }
        ).then(
         function (result){
           //assign a role here
            self.currentUserId=self.auth?self.fullresponse.userId:null;
            self.token=self.auth?self.fullresponse.tokenValue:null;
          } ,
        )
      },
      select: function(option)
      {
        debugger;
        var self=this;
        self.option=option;
      },
      createAccount: function()
      {
        var self=this;
        var accountType= document.getElementById("accountTypeSelect").value.toUpperCase();
        var jAccountType={ "accountType" : accountType}
        PostJSON('https://codegeneration-app.herokuapp.com/v1/bankApi/users/'+self.currentUserId+'/accounts', jAccountType, self.token)
         .then(
          function(result) {
            self.success={
              "type" : "accountCreation",
              "status": true,
              "text" : "An account has been created with the following IBAN"+ JSON.parse(result).Iban
            }
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
            self.success={
              "type" : "accountCreation",
              "Success": false,
              "text" : "An error occured while we were creating the account, please try again later."
            }
           }
        )
      }
    },
  
  })