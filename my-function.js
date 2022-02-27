exports.handler = async (event) => {
    let response={
        statusCode: 200,
        body: 'Sravani Kalangi says '+event["queryStringParameters"]['keyword'],
    };
    return response;
};
