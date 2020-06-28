

var app = new Vue({
    el: '#app',
    data: {
      response:{
        accounts: null,
        users: null,
        specificAccount: null,
        newUser : null
      },
    loading:true,
    password: '',
    auth:null,
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
    getTransactionsInput:{
    },
    userInput:{
      "email": null,
      "password": null,
      "username": null
    },
    createAccountInput:{
      accountOwner: null
    },
    createUserInput:{
      email:null,
      password:null,
      username:null,
      userId:null
    },
    getSpecifcUserAccountInput:{
      id: ""
    },
    editAccountInput:{
      iban: null,
      amount: null,
      ownerId: null,
      type: null,
      status: null,
      transactionLimit: null,
      dayLimit: null,
      absolutelimit: null
    },
    specificAccountInput:{
      Iban : ""
    },
    accountIbanToDelete:'',
    getAllInput:{
    },
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
            if (resultJson.hasOwnProperty('timestamp')){
              self.auth=false;
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            self.userMsg.text="";
            self.auth=resultJson.tokenValue?true:false;
            return result;
          }, 
          error => {
            console.log(error);
            self.loading=false;
           }
        ).then(
         function (result){
           if (!self.auth){
             return;
           }
            var resultJson=(JSON.parse(result));
            self.currentUser.id=resultJson.userId;
            self.currentUser.token=resultJson.tokenValue;
            self.assignRole(self.currentUser.token);
            if (self.currentUser.role=="CUSTOMER")
            self.getSpecifcUserAccount(true);
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
        var valid = self.validateObject(self.createAccountInput);
        if (!valid){
          self.fillInvalidUserMsg("createAccount");
          return;
        }
        PostJSON('https://codegeneration-app.herokuapp.com/v1/bankApi/users/'+self.createAccountInput.accountOwner+'/accounts', jAccountType, self.currentUser.token)
         .then(
          function(result) {
            var resultJson= JSON.parse(result);
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg("createAccount");
              return  Promise.reject();
            }
            self.refreshResponse();
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
        var valid = self.validateObject(self.transactionInput,'transaction')
        if (!valid){
        self.fillInvalidUserMsg("makeTransaction");
        return;
      }
      PostJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/transactions", self.transactionInput, self.currentUser.token)
         .then(
          function(result) {
            if (result==""){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
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
            self.refreshResponse();
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
        var valid = self.validateObject(self.userInput, 'user');
        if (!valid){
        self.fillInvalidUserMsg("editUser");
        return;
      }
      PutJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users/"+self.userInput.userId, self.userInput, self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
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
            self.refreshResponse();
            self.userMsg={
              "type" : "editUser",
              "success": true,
              "text" : "The user has been edited. the new user information is:"+result
            }
          }
        )

      },
      deleteAccount: function(){
        var self= this;
        var valid = true;
        if (self.accountIbanToDelete===""||!self.accountIbanToDelete){
          valid=false;
        }
        if (!valid){
          self.fillInvalidUserMsg("deleteAccount");
          return;
        }
        DeleteJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts/"+self.accountIbanToDelete,self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            if(result!=""){
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
          }
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
            self.refreshResponse();
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
        var valid = self.validateObject(self.getAllInput, 'filter');
        if (!valid){
          self.fillInvalidUserMsg("getAllAccounts");
          return
        }
        var queryParams = self.convertObjectToQuery(self.getAllInput);
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts"+queryParams ,self.currentUser.token)
        .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            self.refreshResponse();
            self.response.accounts= resultJson;
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
        }
        )
      },
      getAllUsers: function (){
        var self = this;
        var valid = self.validateObject(self.getAllInput, 'filter');
        if (!valid){
          self.fillInvalidUserMsg("getAllUsers")
          return;
        }
        var queryParams = self.convertObjectToQuery(self.getAllInput);
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users"+queryParams ,self.currentUser.token)
        .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            self.refreshResponse();
            self.response.users= resultJson;
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
      getSpecificAccount : function(){
        var self = this;
        var valid= self.specificAccountInput.Iban!=""?true:false;
        if (!valid){
          self.fillInvalidUserMsg("getSpecificAccount")
          return;
        }
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts/"+ self.specificAccountInput.Iban,self.currentUser.token)
        .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            self.refreshResponse();
            self.response.specificAccount= resultJson;
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
              "type" : "getSpecifcAccount",
              "success": true,
              "text" : "The request is sent and handled successfully"
            }
          }
        )
      },
      editAccount: function(){
        var self= this;
        var valid = self.validateObject(self.editAccountInput, 'editAccountInput');
        if (!valid){
        self.fillInvalidUserMsg("editAccountInput");
        return;
      }
      PutJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/accounts/"+self.editAccountInput.iban, self.editAccountInput, self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            return result;
          }, 
          error => {
            self.userMsg={
              "type" : "editAccount",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.refreshResponse();
            self.userMsg={
              "type" : "editAccount",
              "success": true,
              "text" : "The account has been edited. the new account information is:"+result
            }
          }
        )
      },
      createUser: function(){
        var self= this;
        var valid = self.validateObject(self.createUserInput, 'createUserInput');
        if (!valid){
        self.fillInvalidUserMsg("createUserInput");
        return;
      }
      PostJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users", self.createUserInput, self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            return JSON.parse(result);
          }, 
          error => {
            self.userMsg={
              "type" : "createUser",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "newUser",
              "success": true,
              "text" : "A new  user has been created."
            }
            self.refreshResponse();
            self.response.newUser= result
          }
        )
      },
      getSpecifcUserAccount: function (currentUser){
        var self= this;
        var idParam= (currentUser==true) ? self.currentUser.id : self.getSpecifcUserAccountInput.id;
        var valid = idParam=="" ? false: true;
        if (!valid){
        self.fillInvalidUserMsg("createUserInput");
        return;
        }
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/users/"+ idParam+"/accounts", self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            if (result!=""){
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            return JSON.parse(result);
          }
          return  Promise.reject();
          }, 
          error => {
            self.userMsg={
              "type" : "getSpecifcUserAccount",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "getSpecifcUserAccount",
              "success": true,
              "text" : "The request is sent and handled successfully"
            }
            self.refreshResponse();
            if(currentUser==true){
              self.currentUser.accounts= result;
              return;
            }
            self.response.specifcUserAccounts= result
          }
        )
      },
      getTransactions : function (){
        var self= this;
        var valid = self.validateObject(self.getTransactionsInput);
        var queryparam= self.convertObjectToQuery(self.getTransactionsInput);
        if (!valid){
        self.fillInvalidUserMsg("createUserInput");
        return;
        }
        GetJSON("https://codegeneration-app.herokuapp.com/v1/bankApi/transactions"+queryparam, self.currentUser.token)
         .then(
          function(result) {
            self.loading=false;
            if (result!=""){
            var resultJson=(JSON.parse(result));
            if (resultJson.hasOwnProperty('timestamp')){
              self.fillErrorUserMsg();
              return  Promise.reject();
            }
            return JSON.parse(result);
          }
          return  Promise.reject();
          }, 
          error => {
            self.userMsg={
              "type" : "getTransactions",
              "success": false,
              "text" : "An error occured while handling this request."
            }
            console.log(error);
            self.loading=false;
           }
        ).then(
          function (result){
            self.userMsg={
              "type" : "getTransactions",
              "success": true,
              "text" : "The request is sent and handled successfully"
            }
            self.refreshResponse();
            self.response.transactions= result;
          }
        )
      },
      validateObject: function (object,type){
        if (type !="filter" && type !="createAccountInput"){
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
      },
      fillInvalidUserMsg: function (type ){
        var self = this;
        self.userMsg={
          "type" : type,
          "success": false,
          "text" : "Invalid input"
        }
        return;
      },
      fillErrorUserMsg: function (type){
        var self = this;
        self.userMsg={
          "type" : type,
          "success": false,
          "text" : "Something went wrong handling this request."
        }
        return;
      },
       refreshResponse: function () {
         var self = this;
         Object.keys(self.response).forEach(function(index) {
          self.response[index] = null
      });    
    }
    },
  })