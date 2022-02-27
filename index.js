const express = require("express");
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: 3306,
        connectionLimit: 5
});

var axios = require('axios');

app.use(bodyParser.json());

const options = {
        swaggerDefinition: {
                info: {
                        title: 'ITIS 6177 - Assignment 08 API',
                        version: '1.0.0',
                        description: 'API designed as part of ITIS 6177 - Assignment 08'
                },
                host: '137.184.106.179:3000',
                basePath: '/',
        },
        apis: ['./index.js'],
};
const specs = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
* @swagger
definitions:
*   agent:
*     type: object
*     required:
*     - agentCode
*     - agentName
*     - workingArea
*     - commission
*     - phoneNo
*     - country
*     properties:
*       agentCode:
*         type: string
*         description: The unique identifiier of an agent
*         example: A001
*       agentName:
*         type: string
*         description: The agent name        
*         example: Subbarao
*       workingArea: 
*         type: string
*         description: The working area of the agent
*         example: Bangalore
*       commission:
*         type: number
*         description: The commission of the agent
*         example: 0.14
*       phoneNo:
*         type: string
*         description: The phone number of the agent
*         example: 077-12346674
*       country:
*         type: string
*         description: The country of the agent
*         example: India
*/

/**
* @swagger
* /agents:
*     get:
*       description: Return all agents
*       produces:
*          - application/json
*       responses:
*          200:
*              description: Object containing array of agent objects
*          404:
*              description: Error executing query
*/

app.get('/agents', (req, res) => {
        pool.query('SELECT * from sample.agents')
                .then(result => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'Application/json');
                        res.send(result);
                })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'Application/json');
                        res.send({ error: "Error executing query" });
                });
});

/**
* @swagger
* /say:
*     get:
*       description: Returns a hello message
*       produces:
*          - text/plain
*       parameters: 
*          - in: query
*            name: keyword
*            description: keyword
*            example: hi
*            required: true
*            schema:
*              type: string
*       responses:
*          200:
*              description: Object containing array of agent objects
*          400:
*              description: Improper request parameters
*          404:
*              description: Error executing query
*/

app.get('/say', (req, res) => {
        if(req.query.keyword){
                axios.get('https://2dp28mh1wf.execute-api.us-east-1.amazonaws.com/default/say?keyword=' + req.query.keyword)
                .then(response=>{
                        res.statusCode = response.status;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send(response.data);
                })
                .catch(err=>{
                        res.statusCode=404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send("Error executing query");
                })
        }else{
                res.statusCode= 400;
                res.setHeader('Content-Type', 'text/plain');
                res.send('Please pass the request parameters like ?keyword=hello in the request');
        }      
});

/**
* @swagger
* /agents:
*  post:
*    description: Inserts agents
*    consumes: 
*    - application/json
*    produces:
*    - application/json
*    parameters:
*    - in: body
*      name: body object
*      schema:
*        $ref: "#/definitions/agent"
*    requestBody:
*      content:
*        application/json:
*          schema:
*            $ref: "#definitions/agent"
*    responses: 
*      200:
*       description: The agent was successfully created
*       content:
*         application/json:
*               schema:
*                  $ref: '#/definitions/agent'
*      201:
*       description: Creation of agent failed
*      400:
*       description: Bad Request (Fields are incorrect or missing)
*      404:
*       description: Error executing query
*/
app.post('/agents', (req, res) => {
        const agent = req.body;
        if (!agent.agentCode || !agent.agentName || !agent.workingArea || !agent.commission || !agent.phoneNo || !agent.country) {
                res.statusCode = 400;
                res.send({ error: "Bad Request (Fields are incorrect or missing)" });
        } else {
                pool.query(`insert into sample.agents values ('${agent.agentCode}', '${agent.agentName}', '${agent.workingArea}', '${agent.commission}', '${agent.phoneNo}', '${agent.country}')`)
                        .then(result => {
                                if (result.affectedRows > 0) {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send(result);
                                } else {
                                        res.statusCode = 201;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send({ error: "Operation  unsuccessful" });
                                }
                        })
                        .catch(err => {
                                res.statusCode = 404;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send({ error: "Error executing query" });
                        });
        }

});

/**
* @swagger
* /agents:
*  put:
*    description: Updates agents
*    consumes: 
*    - application/json
*    produces:
*    - application/json
*    parameters:
*    - in: query
*      name: agentCode
*      description: agent code
*      example: 'A001'
*      required: true
*      schema:
*        type: string
*    - in: body
*      name: body
*      required: true
*      description: body object
*      schema:
*       $ref: '#/definitions/agent'
*    requestBody:
*      request: true
*      content:
*        application/json:
*          schema:
*            $ref: "#definitions/agent"
*    responses: 
*      200:
*       description: The agent was successfully updated
*       content:
*         application/json:
*               schema:
*                  $ref: '#/definitions/agent'
*      201:
*       description: Updation of agent failed
*      400:
*       description: Bad Request (Fields are incorrect or missing)
*      404:
*       description: Error executing query
*/
app.put('/agents', (req, res) => {
        const agent = req.body;
        if (!agent.agentCode || !agent.agentName || !agent.workingArea || !agent.commission || !agent.phoneNo || !agent.country) {
                res.statusCode = 400;
                res.send({ error: "Bad Request (Fields are incorrect or missing)" });
        } else {
                pool.query(`update sample.agents set agent_name = '${agent.agentName}',  working_area = '${agent.workingArea}', commission  = '${agent.commission}', phone_no = '${agent.phoneNo}', country = '${agent.country}' where agent_code = '${agent.agentCode}'`)
                        .then(result => {
                                if (result.affectedRows > 0) {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send(result);
                                }
                                else {
                                        res.statusCode = 201;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send({ error: "Operation  unsuccessful" });
                                }
                        })
                        .catch(err => {
                                res.statusCode = 404;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send({ error: "Error executing query" });
                        });
        }
});

/**
* @swagger
* /agents:
*  patch:
*    description: updates or inserts agents
*    consumes:
*    - application/json
*    produces:
*    - application/json
*    parameters:
*    - in: query
*      name: agentCode
*      description: agent code
*      example: 'A001'
*      required: true
*      schema:
*        type: string
*    - in: body
*      name: body
*      required: true
*      description: body object
*      schema:
*       $ref: '#/definitions/agent'
*    requestBody:
*      request: true
*      content:
*        application/json:
*          schema:
*            $ref: "#definitions/agent"
*    responses:
*      200:
*       description: The agent was successfully updated
*       content:
*         application/json:
*               schema:
*                  $ref: '#/definitions/agent'
*      201:
*       description: Updation of agent failed
*      400:
*       description: Bad Request (Fields are incorrect or missing)
*      404:
*       description: Error executing query
*/
app.patch('/agents', (req, res) => {
        const agent = req.body;
        if (!agent.agentCode || !agent.agentName || !agent.workingArea || !agent.commission || !agent.phoneNo || !agent.country) {
                res.statusCode = 400;
                res.send({ error: "Bad Request (Fields are incorrect or missing)" });
        } else {
                pool.query(`update sample.agents set agent_name = '${agent.agentName}',  working_area = '${agent.workingArea}', commission  = '${agent.commission}', phone_no = '${agent.phoneNo}', country = '${agent.country}' where agent_code = '${agent.agentCode}'`)
                        .then(result => {
                                if (result.affectedRows > 0) {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send(result);
                                }
                                else {
                                        pool.query(`insert into sample.agents values('${agent.agentCode}', '${agent.agentName}', '${agent.workingArea}', '${agent.commission}', '${agent.phoneNo}', '${agent.country}')`)
                                                .then(res1 => {
                                                        if (res1.affectedRows > 0) {
                                                                res.statusCode = 200;
                                                                res.setHeader('Content-Type', 'Application/json');
                                                                res.send(res1);
                                                        }
                                                        else {
                                                                res.statusCode = 201;
                                                                res.setHeader('Content-Type', 'Application/json');
                                                                res.send({ error: "Operation  unsuccessful" });
                                                        }
                                                })
                                                .catch(err => {
                                                        res.statusCode = 404;
                                                        res.setHeader('Content-Type', 'Application/json');
                                                        res.send({ error: "Error executing query" });
                                                });
                                }
                        })
                        .catch(err => {
                                res.statusCode = 404;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send({ error: "Error executing query" });
                        });
        }
});

/**
* @swagger
* /agents:
*  delete:
*    description: Removes agent
*    consumes: 
*    - application/json
*    produces:
*    - application/json
*    parameters:
*    - in: query
*      name: agentCode
*      description: agent code
*      example: 'A001'
*      required: true
*      schema:
*        type: string
*    responses:
*      200:
*       description: The agent was successfully deleted
*      201:
*       description: Deletion of agent failed
*      400:
*       description: Bad Request (Fields are incorrect or missing)
*      404:
*       description: Error executing query
*/
app.delete('/agents', (req, res) => {
        const agentCode = req.query.agentCode
        if (!agentCode) {
                res.statusCode = 400;
                res.send({ error: "Bad Request (Fields are incorrect or missing)" });
        } else {
                pool.query(`delete from sample.agents where agent_Code =  "${req['query'].agentCode}" `)
                        .then(result => {
                                if (result.affectedRows > 0) {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send(result);
                                } else {
                                        res.statusCode = 201;
                                        res.setHeader('Content-Type', 'Application/json');
                                        res.send({ error: "Operation unsuccessful" });
                                }
                        })
                        .catch(err => {
                                res.statusCode = 404;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send({ error: "Error executing query" });
                        });

        }
});


app.listen(port, () => {
        console.log(`API served at http://137.184.106.179:${port}`);
})