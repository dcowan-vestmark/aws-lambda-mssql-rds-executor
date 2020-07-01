# aws-lambda-mssql-rds-executor

This lambda package will take an environment variable SQL_SCRIPT and run that script upon execution.  It is designed to run a script based on events from an MSSQL RDS instance.  For example on reboot execute a script to add permissions to the tempdb.  The password is passed in via the environment variable RDS_PASSWORD.  The rest of the db parameters are pulled from the RDS db instance api.


Suggested AWS Policy to use for VPC based lambda
```
"document": {
    "Version": "2012-10-17",
    "Statement": [
        {
        "Effect": "Allow",
        "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "rds:DescribeDBInstances",
            "ec2:CreateNetworkInterface",
            "ec2:DescribeNetworkInterfaces",
            "ec2:DeleteNetworkInterface"
        ],
        "Resource": "*"
        }
    ]
}
```