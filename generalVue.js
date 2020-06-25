

var app = new Vue({
    el: '#app',
    data: {
    loading:true,
    token: '',
    username: '',
    password: '',
    currentUserId: '',
    auth:false,
    role:null,
    option:'',
    userMsg:{
      "type" : "",
      "status": false,
      "text": ""
    },
    transactionInput:{
      "Sender": null,
      "Receiver": null,
      "ReceiverName": null,
      "Amount": null,
      "Performedby" : null
    },
    userInput:{
      "email": null,
      "password": null,
      "userId": null,
      "username": null
    },
    accountIbanToDelete:''
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
            var resultJson=(JSON.parse(result));
            self.auth=resultJson.tokenValue?true:false;
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
           }
        ).then(
         function (result){
            var resultJson=(JSON.parse(result));
            self.currentUserId=self.auth?resultJson.userId:null;
            self.token=self.auth?resultJson.tokenValue:null;
            if (self.auth)
            self.assignRole(self.token);
            self.loading=false;
          },
        )
      },
      select: function(option)
      {
        debugger;
        var self=this;
        self.option=option;
      },
      assignRole: function(token){
        var self= this;
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        self.role= JSON.parse(jsonPayload).rol[0]?JSON.parse(jsonPayload).rol[0]:'undefined';
      }
      ,
      createAccount: function()
      {
        var self=this;
        var accountType= document.getElementById("accountTypeSelect").value.toUpperCase();
        var jAccountType={ "accountType" : accountType}
        PostJSON('https://codegeneration-app.herokuapp.com/v1/bankApi/users/'+self.currentUserId+'/accounts', jAccountType, self.token)
         .then(
          function(result) {
            self.userMsg={
              "type" : "accountCreation",
              "status": true,
              "text" : "An account has been created with the following IBAN"+ JSON.parse(result).Iban
            }
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
            self.userMsg={
              "type" : "accountCreation",
              "Success": false,
              "text" : "An error occured while we were creating the account, please try again later."
            }
           }
        )
      },
      makeTransaction: function(){
        var self= this;
        self.transactionInput.Performedby=self.role.charAt(0).toUpperCase() + self.role.slice(1).toLowerCase();
        var valid =self.validate(self.transactionInput);
        debugger;
      },
      editUser : function(){
        var self= this;
        var valid = self.validate(self.userInput);
        debugger;
      },
      deleteAccount: function(){
        var self= this;
        var valid = self.validate(self.userInput);
        debugger;
      },
      validate(object){
        for (var key in object) {
          if (object[key] == null || object[key] == "")
              return false;
      }
      return true;
      }
    },
  
  })