const express = require('express');
const database = require('./database');
const server = express();
server.use(express.json());

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

let nextId = null;

server.get('/', (req,res) => {
    return res.json({result: 'Desafio API bloco de notas'});
});

async function getNextId(req, res, next) {
    await database.query(`SELECT MAX(id) from desafio_api_bloco_de_notas;`,
    {type: database.QueryTypes.SELECT})
    .then(id => {
        nextId = id[0].max;
        nextId ++;
    });

    next();
}


//inserir nota
server.post('/notes', getNextId, async (req,res) => {

    let inseriuNota;
    const {id, title, content, hour,date} = req.body;

    await database.query(`INSERT INTO desafio_api_bloco_de_notas VALUES (${nextId}, '${title}', '${content}', '${hour}', '${date}');`,
        {type: database.QueryTypes.INSERT})
        .then(result => {
            inseriuNota = result
        })
        .catch(error => {
            return res.json(error);
    });

    if (inseriuNota[1]){
        return res.json('nota inserida com sucesso');
    } else {
        return res.json ('não foi possível cadastrar a nota');
    }
});

//buscar notas cadastradas
server.get('/notes', async (req,res) => {
    let notes;

    await database.query(`SELECT * FROM desafio_api_bloco_de_notas;`,
        {type: database.QueryTypes.SELECT})
        .then(results => {
            notes = results;
        }).catch(err => {
            return res.json('erro ao buscar notas');
    });

    return res.json({notes});
});

//buscar uma nota pelo id
server.get('/notes/:id', async (req,res) => {
    let note;
    const {id} = req.params;

    await database.query(`SELECT * FROM desafio_api_bloco_de_notas WHERE id = ${id};`,
        {type: database.QueryTypes.SELECT})
        .then(result => {
            note = result;
        }).catch(err => {
            return res.json('erro ao buscar notas');
    });

    return res.json({note});
});

//deletar nota pelo id
server.delete('/notes/:id', async (req,res) => {   
    const {id} = req.params;

    await database.query(`DELETE FROM desafio_api_bloco_de_notas WHERE id = ${id};`,
        {type: database.QueryTypes.DELETE})
        .catch(err => {
            return res.json(err);
    });

    return res.json({
        resul: 'nota excluída com sucesso',
    });
});

//atualizar nota pelo id
server.put('/notes/:id', async (req,res) => {
    let noteUpdate;
    const {id} = req.params;
    const {title, content, hour,date} = req.body;

    await database.query(`UPDATE desafio_api_bloco_de_notas SET title = '${title}', content = '${content}', hour = '${hour}', date = '${date}' WHERE id = ${id};`,
        {type: database.QueryTypes.UPDATE})
        .then(result => {
            noteUpdate = result
        })
        .catch(err => {
            return res.json('erro ao inserir nota');
    });

    return res.json({
        resul: 'nota atualizada com sucesso',
    });
});

server.listen(process.env.PORT); 