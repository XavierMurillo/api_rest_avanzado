const { obtenerJoyas, obtenerJoyasPorFiltros, joyasHateoas } = require("./consultas");
const registroConsultas = () =>{

}

const express = require("express");
const app = express();
app.listen(3000, console.log("Server ON"));

const consultaReporte = async(req, res, next) =>{
    console.log(`Se realizo una consulta a la ruta ${req.route.path}`);
    next();
}

app.get("/joyas", consultaReporte, async (req, res) => {
    try{
        const queryStrings = req.query;
        const joyas = await obtenerJoyas(queryStrings);
        const joyasHate = await joyasHateoas(joyas);
        res.json(joyasHate);
    }
    catch({code, message}){
        if(code == 404)
        {
            res.status(code).send("Parametros no validos, no se encontro coincidencias");
        }
        else{
            res.status(500).send(`Error interno del servidor: ${message}`);
        }
    }

});

app.get("/joyas/filtros",consultaReporte, async (req, res) => {
    try{
        const queryStrings = req.query;
        const joyasFiltros = await obtenerJoyasPorFiltros(queryStrings);
        res.json(joyasFiltros);
    }
    catch(error){
        res.status(500).send(`Error interno del servidor: ${error}`);
    }
});

app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe")
    })