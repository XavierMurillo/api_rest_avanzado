const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "pgadmin",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true,
});
const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 1 }) => {
    try {
        const [campo, direccion] = order_by.split("_");
        const offset = (page - 1) * limits;
        const formattedQuery = format(
          "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
          campo,
          direccion,
          limits,
          offset
        );
        const { rows: inventario } = await pool.query(formattedQuery);  
        return inventario;
    } catch(error) {
        throw {"code": 404, "message": "Error al obtener las joyas"};
    }
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let filtros = [];
  const values = [];
  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (precio_min) agregarFiltro("precio", ">=", precio_min);
  if (categoria) agregarFiltro("categoria", "=", categoria);
  if (metal) agregarFiltro("metal", "=", metal);

  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }
  const { rows: medicamentos } = await pool.query(consulta, values);
  return medicamentos;
};

const joyasHateoas = (joyas) => {
    const results = joyas.map((joya) =>{
        return{
            "name": joya.nombre,
            "href": `/joyas/joya/${joya.id}`
        }
    })
    const total = joyas.length;
    const HATEOAS = {
        total,
        results
    }
    return HATEOAS;
}

module.exports = { obtenerJoyas, obtenerJoyasPorFiltros, joyasHateoas };