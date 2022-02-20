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

app.use(bodyParser.json());

const options = {
        swaggerDefinition: {
                info: {
                        title: 'ITIS 6177 - Assignment 08 API',
                        version: '1.0.0',
                        description: 'API designed as part of ITIS 6177 - Assignment 08'
                },
                host: '137.184.136.156:3000',
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
        pool.query('SELECT * from agents')
                .then(result => {
                        console.log(result);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'Application/json');
                        res.send(result);
                })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Error executing query');
                });
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
*      404:
*       description: Error executing query
*/
app.post('/agents', (req, res) => {
        pool.query(`insert into sample.agents values ('${req['body'].agentCode}', '${req['body'].agentName}', '${req['body'].workingArea}', '${req['body'].commission}', '${req['body'].phoneNo}', '${req['body'].country}')`)
                .then(result => {
                        if (result.affectedRows > 0) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send(result);
                        } else {
                                res.statusCode = 201;
                                res.setHeader('Content-Type', 'text/plain');
                                res.send("Operation  unsuccessful");
                        }
                })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Error executing query');
                });
});

/**
* @swagger
* /agents?agentCode=:
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
*      404:
*       description: Error executing query
*/
app.put('/agents', (req, res) => {
        pool.query(`update sample.agents set agent_name = '${req['body'].agentName}',  working_area = '${req['body'].workingArea}', commission  = '${req['body'].commission}', phone_no = '${req['body'].phoneNo}', country = '${req['body'].country}' where agent_code = '${req['body'].agentCode}'`)
                .then(result => {
                        if (result.affectedRows > 0) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send(result);
                        }
                        else {
                                res.statusCode = 201;
                                res.setHeader('Content-Type', 'text/plain');
                                res.send("Operation  unsuccessful");
                        }
                })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Error executing query');
                });
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
*      404:
*       description: Error executing query
*/
app.patch('/agents', (req, res) => {
        pool.query(`update sample.agents set agent_name = '${req['body'].agentName}',  working_area = '${req['body'].workingArea}', commission  = '${req['body'].commission}', phone_no = '${req['body'].phoneNo}', country = '${req['body'].country}' where agent_code = '${req['body'].agentCode}'`)
                .then(result => {
                        if (result.affectedRows > 0) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'Application/json');
                                res.send(result);
                        }
                        else {
                                pool.query(`insert into sample.agents values('${req['body'].agentCode}', '${req['body'].agentName}', '${req['body'].workingArea}', '${req['body'].commission}', '${req['body'].phoneNo}', '${req['body'].country}')`)
                                        .then(res1 => {
                                                if (res1.affectedRows > 0) {
                                                        res.statusCode = 200;
                                                        res.setHeader('Content-Type', 'Application/json');
                                                        res.send(res1);
                                                }
                                                else {
                                                        res.statusCode = 201;
                                                        res.setHeader('Content-Type', 'text/plain');
                                                        res.send("Operation  unsuccessful");
                                                }
                                        })
                                        .catch(err => {
                                                res.statusCode = 404;
                                                res.setHeader('Content-Type', 'text/plain');
                                                res.send('Error executing query');
                                        });
                        }
                })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Error executing query');
                });
});

/**
* @swagger
* /agents?agentCode=:
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
*      404:
*       description: Error executing query
*/
app.delete('/agents', (req, res) => {
        console.log(`${req['query'].agentCode}`);
        pool.query(`delete from sample.agents where agent_Code =  ('${req['query'].agentCode}')`)
        .then(result => {
                if (result.affectedRows > 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'Application/json');
                        res.send(result);
                } else {
                        res.statusCode = 201;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Operation unsuccessful');
                }
        })
                .catch(err => {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Error executing query');
                });
});


app.listen(port, () => {
        console.log(`API served at http://137.184.136.156:${port}`);
})