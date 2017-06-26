//Importando modulos
var express = require('express');
var router = express.Router();

//Importo o modelo Profile
var Profile = require('../models/Profile');


/////////////////////////////INSERT/////////////////////////////

//Rota responsável por cadastrar Profile
router.post('/', function (req, res) {

    //Preenchendo o modelo Profile com os dados vindos do body
    var data = new Profile({
        nome: req.body.nome,
        sexo: req.body.sexo,
        email: req.body.email,
        dataNascimento: req.body.dataNascimento,
        competencia: [{
            descricao: req.body.descricao,
            proficiencia: req.body.proficiencia
        }]
    });

    //Com o objeto preenchido, chamamos o metodo 'save' para salvar esta informação no banco MongoDB
    data.save(function (err, profile) {

        //Caso ocorra algum erro ao executar o save
        //a rota retornará um json informando que houve erro, uma menssagem e o erro que ocorreu
        if (err)
            res.json({ 'status': 'error', 'msg': 'Ocorreu erro ao tentar salvar Profile.', 'error': err });

        //Caso Profile for salvo com sucesso, retornará json informando o sucesso e o dado que foi salvo
        res.json({ 'status': 'success', 'msg': 'Profile salvo com sucesso.', profile });
    });
});


//////////////////////////////READ//////////////////////////////

//Rota para retornar todos os profiles cadastrados
router.get('/', function (req, res) {
    Profile.find(function (err, profiles) {
        //Caso ocorra erro ao efetuar consulta, retornar json com mensagem e o erro que ocorreu
        if (err)
            res.json({ 'status': 'error', 'msg': 'Erro ao buscar profiles cadastrados.', 'error': err });

        //Retorna json informando que busca foi feita com sucesso e os profiles encontrados
        res.json({ 'status': 'success', 'profiles': profiles });
    });
});

//Rota para buscar profile pelo id
router.get('/:id', function (req, res) {

    //Obtenho o valor ':id' da querystring que vem da rota da URL
    var id = req.params.id;

    //Utilizo a função findById para buscar um documento em especifico pelo ID
    Profile.findById(

        //No primeiro parâmetro vou informar o id que quero buscar no campo _id
        { '_id': id },
        //No segundo parâmetro temos o callback onde podemos obter os erros ou o resultado da consulta
        function (err, profile) {
            if (err)
                res.json({ 'status': 'error', 'msg': 'Erro ao buscar profile', 'error': err });

            res.json({ 'status': 'success', 'profile': profile })
        });
});

//Rota para buscar profiles pela competência, por exemplo, buscar todos os usuários que possuem python como competência
router.get('/competencia/:competencia', function (req, res) {

    //Obtenho o valor ':competência' da querystring que vem da rota da URL
    var competencia = req.params.competencia;

    Profile.find(

        //No primeiro parâmetro vou informar a competência que quero buscar no campo 'competencia.descricao'
        { 'competencia.descricao': competencia },
        //Segundo paramentro serve para filtrar quais informações quero no retorno da consulta, apenas a titulo de curiosidade
        //vou informar que quero que a consulta retorne apenas os campos (NOME, SEXO, EMAIL, e apenas a descrição e a proficiencia da COMPETÊNCIA)
        { nome: 1, sexo: 1, email: 1, 'competencia.descricao': 1, 'competencia.proficiencia': 1 },
        //No segundo parâmetro temos o callback onde podemos obter os erros ou o resultado da consulta
        function (err, profiles) {
            if (err)
                res.json({ 'status': 'error', 'msg': 'Erro ao buscar profiles', 'error': err });

            res.json({ 'status': 'success', 'profiles': profiles })
        });
});


/////////////////////////////UPDATE/////////////////////////////

//Rota responsável por atualizar as informações de determinado profile
router.put('/:id', function (req, res) {

    //Obtenho o valor ':id' da querystring que vem da rota da URL
    var id = req.params.id;

    //Primeiramente, buscamos o profile a ser alterado pelo id
    Profile.findById(
        { '_id': id },
        function (err, profile) {
            if (err) {
                res.json({ 'status': 'error', 'msg': 'Erro ao buscar profile.', 'error': err });
            }
            else {
                //Após localizar o profile a ser alterado, alteramos cada atributo com os valores enviados no body, caso o atributo
                //não esteja no body, deixamos o valor orignal para este campo
                profile.nome = req.body.nome || profile.nome;
                profile.sexo = req.body.sexo || profile.sexo;
                profile.email = req.body.email || profile.email;
                profile.dataNascimento = req.body.dataNascimento || profile.dataNascimento;
                profile.competencia = req.body.competencia || profile.competencia;

                //Após preencher o objeto, salvamos ele na base da dados
                profile.save(function (err, profile) {
                    if (err)
                        res.json({ 'status': 'error', 'msg': 'Erro ao salvar alterações de profile.', 'error': err });

                    res.json({ 'status': 'success', 'msg': 'Profile alterado com sucesso.', 'profile': profile });
                });
            }
        });
});

//Rota responsável por adicionar competência a profile especifico
router.put('/competencia/add/:id', function (req, res) {

    //Obtenho o valor ':id' da querystring que vem da rota da URL
    var id = req.params.id;

    //Função responsável por buscar o registro mais recente adicionar uma nova competência para o profile
    Profile.findByIdAndUpdate(

        //Busa pelo profile por id
        { '_id': id },
        //Utiliza o $push para poder adicionar na ultima posição do array de competências uma nova competência
        {
            '$push': {
                'competencia': {
                    'descricao': req.body.descricao,
                    'proficiencia': req.body.proficiencia
                }
            }
        },
        function (err) {
            //Caso ocorra erro ao salvar as alterações no profile
            if (err)
                res.json({ 'status': 'error', 'msg': 'Erro ao adicionar nova competência.', 'error': err });

            //Caso competência tenha sido adicionada com sucesso
            res.json({ 'status': 'success', 'msg': 'competência adicionada com sucesso,' })
        });
});

//Rota responsável por remover competência de profile
router.put('/competencia/del/:id/:idCompetencia', function (req, res) {

    //Obtenho o id do profile do valor ':id' da querystring que vem da rota da URL.
    var idProfile = req.params.id;
    //Obtenho o id da competência do profile do valor ':idCompetencia' da querystring que vem da rota da URL.
    var idCompetencia = req.params.idCompetencia;

    Profile.findByIdAndUpdate(
        { '_id': idProfile },
        //Utilizo o $pull para poder remover do array uma competência especifica identificada pelo id
        {
            '$pull': { 'competencia': { '_id': idCompetencia } }
        },
        function (err) {
            //Caso ocorra erro ao salvar as alterações no profile
            if (err)
                res.json({ 'status': 'error', 'msg': 'Erro ao remover competência.', 'error': err });

            //Caso competencia tenha sido removido com sucesso
            res.json({ 'status': 'success', 'msg': 'Competencia removida com sucesso,' })
        });
});


/////////////////////////////DELETE/////////////////////////////

//Rota responsável por deletar registro do banco
router.delete('/:id', function (req, res) {

    //Obtenho o id do profile do valor ':id' da querystring que vem da rota da URL.
    var id = req.params.id;

    //findOneAndRemove função responsável por buscar e deletar registro da base de dados
    Profile.findOneAndRemove(
        { '_id': id },
        function (err) {
            //Caso ocorra erro ao tentar remover o registro, retorna mensagem e erro que ocorreu
            if (err)
                res.json({ 'status': 'error', 'msg': 'Ocorreu erro ao tentar remover profile.', 'error': err });

            //Caso profile tenha sido delatado com sucesso
            res.json({ 'status': 'success', 'msg': 'Profile removido com sucesso.' });
        });
});


module.exports = router;