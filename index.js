const rds = require("aws-sdk/clients/rds"),
  sns = require("aws-sdk/clients/sns"),
  fs = require("fs"),
  sql = require("mssql");

const awsClient = new rds();

exports.handler = async (event, context) => {
  console.log("Event=" + JSON.stringify(event));

  var dbInstanceName;
  if (process.env.DB_INSTANCE_NAME) {
	console.log("Using DB_INSTANCE_NAME env var");
	dbInstanceName = process.env.DB_INSTANCE_NAME;
  }

  if (dbInstanceName == null && event.Records[0].EventSource == 'aws:sns') {
	console.log("Getting database instance id from sns event");

	const record = JSON.parse(event.Records[0].Sns.Message);

	if (record["Event Source"] != "db-instance") {
	  console.log("Exiting due to no db-instance Event Source");
	  context.fail("Exiting due to no db-instance Event Source");
	  return;
	}
	dbInstanceName = record["Source ID"];
  }
 
  console.log("Requesting instance information for: " + dbInstanceName);
  var data = await awsClient
    .describeDBInstances({
      DBInstanceIdentifier: dbInstanceName,
    })
    .promise();

  if (data.DBInstances.length == 0) {
	console.log("No DB Instance found");
	context.fail("No DB Instance found");
    return;
  }

  var instance = data.DBInstances[0];

  try {
    const config = {
      user: instance.MasterUsername,
      password: process.env.RDS_PASSWORD,
      server: instance.Endpoint.Address,
      database: "tempdb",
      options: {
        enableArithAbort: true,
      },
    };
    console.log("connecting to " + instance.Endpoint.Address);
    await sql.connect(config);
    const result = await sql.query(process.env.SQL_SCRIPT);
    console.dir(result);
  } catch (err) {
	console.error("Error executing sql: " + err);
	context.fail("Error executing sql: " + err);
  }
};
