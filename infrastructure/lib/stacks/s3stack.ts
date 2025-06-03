import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface WebsiteProps extends StackProps {}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: WebsiteProps) {
    super(scope, id, props);
    const self: Construct = this;

    const s3Bucket = new Bucket(self, `${id}-bucket`, {
      websiteIndexDocument: "index.html",

      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,

      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      versioned: true,
    });

    new BucketDeployment(self, `${id}-deployment`, {
      sources: [Source.asset("../front-end")],
      destinationBucket: s3Bucket,
    });

    new CfnOutput(self, `${id}-uri-link`, {
      value: s3Bucket.bucketWebsiteUrl,
    });
  }
}
