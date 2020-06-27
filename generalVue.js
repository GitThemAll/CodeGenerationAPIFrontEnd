

var app = new Vue({
    el: '#app',
    data: {
      response:{
        accounts: null,
        users: null
      },
    loading:true,
    password: '',
    auth:false,
    option:'',
    currentUser:{
      role: null,
      id: null,
      username: null,
      token: null,
      accounts:null
    },
    userMsg:{
      "type" : "",
      "success": null,
      "text": ""
    },
    transactionInput:{
      "Sender": null,
      "Receiver": null,
      "ReceiverName": null,
      "Amount": 0,
      "Performedby" : null
    },
    userInput:{
      "email": null,
      "password": null,
      "oldUserId" : null,
      "newUserId": null,
      "username": null
    },
    createAccountInput:{
      accountOwner: null
    },
    accountIbanToDelete:'',
    getAllInput:{
      "filter" : null,
      "offset" : null
    }
    },
    methods: {
    processLogin: function()
      {
        var self = this;
          var credentials= {
            "username" :self.currentUser.username, 
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
            self.currentUser.id=self.auth?resultJson.userId:null;
            self.currentUser.token=self.auth?resultJson.tokenValue:null;
            if (self.auth)
            self.assignRole(self.currentUser.token);
            // if (self.currentUser.role=="CUSTOMER")
            self.getAllAccounts(true);
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
        self.currentUser.role= JSON.parse(jsonPayload).rol[0]?JSON.parse(jsonPayload).rol[0]:'undefined';
      },
      createAccount: function()
      {
        var self=this;
        var accountType= document.getElementById("accountTypeSelect").value.toUpperCase();
        var jAccountType={ "accountType" : accountType}
        var valid = self.validate(self.createAccountInput);
        if (!valid){
          self.userMsg={
            "type" : "accountCreation",
            "success": false,
            "text" : "Invalid input"
          }
          return;
        }
        PostJSON('https://codegeneration-app.herokuapp.com/v1/bankApi/users/'+self.createAccountInput.userId+'/accounts', jAccountType, self.currentUser.token)
         .then(
          function(result) {
            self.userMsg={
              "type" : "createAccount",
              "success": true,
              "text" : "An account has been created with the following IBAN: "+ JSON.parse(result).iban
            }
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
            self.userMsg={
              "type" : "accountCreation",
              "success": false,
              "text" : "An error occured while creating the account, please try again later."
            }
           }
        )
      },
      makeTransaction: function(){
        var self= this;
        self.transactionInput.Performedby=self.currentUser.role;
        var valid = self.validate(self.transactionInput,'transaction')
        if (!valid){
        self.userMsg={
          "type" : "makeTransaction",
          "success": false,
          "text" : "invalid input."
        }
        return;
      }
      PostJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/transactions", self.transactionInput, self.currentUser.token)
         .then(
          function(result) {
            var resultJson=(JSON.parse(result));
            self.loading=false;
            return resultJson;
          }, 
          error => {
            self.userMsg={
              "type" : "makeTransaction",
              "success": true,
              "text" : "An error occured while sending the transaction, please try later."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "makeTransaction",
              "success": true,
              "text" : "Your transaction with id "+result.id +" is sent."
            }
          }
        )
      
      },
      editUser : function(){
        var self= this;
        var valid = self.validate(self.userInput, 'user');
        if (!valid){
        self.userMsg={
          "type" : "editUser",
          "success": false,
          "text" : "invalid input."
        }
        return;
      }
      PutJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users/"+self.userInput.oldUserId, self.userInput, self.currentUser.token)
         .then(
          function(result) {
            var resultJson=(JSON.parse(result));
            self.loading=false;
            return result;
          }, 
          error => {
            self.userMsg={
              "type" : "editUser",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "editUser",
              "success": true,
              "text" : "The user has been edited input. the new user information is:"+result
            }
          }
        )

      },
      deleteAccount: function(){
        var self= this;
        var valid =- true;
        if (self.accountIbanToDelete===""||!self.accountIbanToDelete){
          valid=false;
        }
        if (!valid){
          self.userMsg={
            "type" : "deleteAccount",
            "success": false,
            "text" : "invalid input."
          }
          return;
        }
        DeleteRequest("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts/"+self.accountIbanToDelete+"/"+self.accountIbanToDelete,self.currentUser.token)
         .then(
          function(result) {
            var resultJson=(JSON.parse(result));
            self.loading=false;
            return result;
          },
          error => {
            self.userMsg={
              "type" : "deleteAccount",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "deleteAccount",
              "success": true,
              "text" : "The user has been edited. the new user information is:"+result
            }
          }
        )

        
      },
      getAllAccounts: function (currentUser){
        var self = this;
        var valid= true;
        if (!currentUser)
        var valid = self.validate(self.getAllInput, 'filter');
        if (!valid){
          self.userMsg={
            "type" : "getAllAccounts",
            "success": false,
            "text" : "Invalid input"
          }
          return
        }
        var queryParams =currentUser?"?accountOwner"+self.currentUser.id :self.convertObjectToQuery(self.getAllInput);
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts"+queryParams ,self.currentUser.token)
        .then(
          function(result) {
            var resultJson=(JSON.parse(result));
            self.response.accounts= resultJson;
            self.loading=false;
            return resultJson;
          },
          error => {
            if (!currentUser){
            self.userMsg={
              "type" : "getAllAccounts",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
            }
           }
        ).then(
          function (result){
            if (!currentUser){
            self.userMsg={
              "type" : "getAllAccounts",
              "success": true,
              "text" : "The request is sent and handled successfully"
            }
            return;
          }
          currentUser.accounts=result;
        }
        )
      },
      getAllUsers: function (){
        var self = this;
        var valid = self.validate(self.getAllInput, 'filter');
        
        if (!valid){
          self.userMsg={
            "type" : "getUsersAccounts",
            "success": false,
            "text" : "Invalid input"
          }
          return
        }
        var queryParams = self.convertObjectToQuery(self.getAllInput);
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users"+queryParams ,self.currentUser.token)
        .then(
          function(result) {
            var resultJson=(JSON.parse(result));
            self.response.users= resultJson;
            self.loading=false;
            return result;
          },
          error => {
            self.userMsg={
              "type" : "getAllUsers",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "getAllUsers",
              "success": true,
              "text" : "The request is sent and handled successfully"
            }
          }
        )
      },
      validate: function (object,type){
        if (type !="filter" || type !="createAccountInput"){
        for (var key in object) {
          if (object[key] == null || object[key] == "")
              return false;
        }
      }
      switch(type) {
        case "transaction":
          if (object.Amount<=0)
          return false;
          break;
        case "account":
          // code block
          break;
        case "user":
          // code block
          break;
        case "filter":
        object.filter= object.filter==null?0:object.filter;
        object.offset= object.offset==null?0:object.offset;
         if( object.filter<0)
         return false;
         if(object.offset<0)
         return false
         break;
        default:
          // code block
      }
      return true;
      },
      convertObjectToQuery: function (object){
        var result = "?" + Object.keys(object).map(key => key + '=' + object[key]).join('&');
        return result
      }
    },
  })