import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new sqs.CfnQueue(this, "SampleQueue", {
      queueName: "sample-cdk-queue",
      visibilityTimeout: 10,
      delaySeconds: 10,
    });

    const key = new kms.Key(this, "SampleKey", {
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["kms:*"],
            resources: ["*"],
            principals: [new iam.AccountRootPrincipal()],
          }),
          new iam.PolicyStatement({
            actions: [
              "kms:Decrypt*",
              "kms:Encrypt*",
              "kms:ReEncrypt*",
              "kms:GenerateDataKey*",
              "kms:Describe*",
            ],
            resources: ["*"],
            principals: [
              new iam.ServicePrincipal(`logs.${this.region}.amazonaws.com`),
            ],
            conditions: {
              ArnEquals: {
                "kms:EncryptionContext:aws:logs:arn": `arn:aws:logs:${this.region}:${this.account}:log-group:*`,
              },
            },
          }),
        ],
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new logs.CfnLogGroup(this, "SampleLogGroup", {
      logGroupName: "sample-cdk-log-group",
      retentionInDays: 30,
      kmsKeyId: key.keyArn,
    });
  }
}
