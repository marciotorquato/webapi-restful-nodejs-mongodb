//Importando modulos
var mongoose = require('mongoose');

//PROPRIEDADES
//  require: true  Campo possui preenchimento obrigatório
//  require: false Campo possui preenchimento não obrigatório
//  default: para definir valores padrões caso nenhum outro valor for informado para este campo
//  enum   : para definirmos os valores que determinado campo aceita, não sendo possivel inserir valores diferentes
//  unique : responsável por tornar o valor unico dentro do registro

//Construindo a estrutura 
var Profile = mongoose.Schema({
    nome: { type: String, require: true },
    sexo: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    dataNascimento: { type: Date, require: true },
    dataCadastro: { type: Date, default: Date.Now },
    competencia: [{
        descricao: { type: String },
        proficiencia: { type: String, enum: ['basico', 'intermediario', 'avancado'], default: 'Basico' }
    }]
});

module.exports = mongoose.model('Profile', Profile);