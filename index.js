const rds = require('aws-sdk/clients/rds'),
      sns = require('aws-sdk/clients/sns'),
      fs = require('fs'),
      sql = require('mssql');

const awsClient = new rds();

exports.handler = async (event, context) => {
  console.log("Event=" + JSON.stringify(event))
  const record = JSON.parse(event.Records[0].Sns.Message);

  if (record["Event Source"] != "db-instance") { return; }
  //if (record["Event Message"] != "DB instance created") { return; }

  console.log("Requesting instance information for: " + record["Source ID"]);
  var data = await awsClient.describeDBInstances(
    {DBInstanceIdentifier: record["Source ID"]}
  ).promise();

  if (data.DBInstances.length == 0) { 
    console.log("No DB Instance found")
    return; 
  }

  var instance = data.DBInstances[0];

  try {
      const config = {
          user: instance.MasterUsername,
          password: process.env.RDS_PASSWORD,
          server: instance.Endpoint.Address, 
          database: 'tempdb',
          options: {
            enableArithAbort: true
          }
      }
      console.log("connecting to " + instance.Endpoint.Address)
      await sql.connect(config)
      const result = await sql.query(process.env.SQL_SCRIPT)
      console.dir(result)
  } catch (err) {
    console.error("Error executing sql: " + err)
  }
};