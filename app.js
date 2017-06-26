//Importando os modulos necessarios para o projeto
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializo o Express
var app = express();

//Criando conexão com banco 'estudo' que é do tipo mongodb através do mongoose
var db = mongoose.connect('mongodb://localhost/estudo').connection;

//Caso a conexão tenha ocorrido com sucesso
db.on('open', function () {
    console.log('MongoDB is Connected');
});

//Caso ocorra erro ao estabelecer conexão com banco
db.on('error', function (error) {
    console.log(error);
});


//Analisa o body como JSON
app.use(bodyParser.json());

//Permite analisar os dados codificados por url
app.use(bodyParser.urlencoded({ 'extended': 'true' }));

//Importo as rotas contidas no arquivo profile
var ProfileRouter = require('./app/routes/profile');

//Adiciono rota para acesso as rotas do arquivo profile
app.use('*/profile', ProfileRouter);

//Inicializo aplicação na porta 3000
app.listen(3000, function () {
    console.log('Service Started');
});