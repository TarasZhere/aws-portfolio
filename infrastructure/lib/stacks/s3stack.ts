import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'

interface WebsiteProps extends StackProps {}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: WebsiteProps) {
    super(scope, id, props)
    const self: Construct = this
    const domainName = 'taras.click'
    const hostedZone = HostedZone.fromHostedZoneId(
      this,
      'HostedZone',
      'Z038349417XTGZS79FSNC',
    )

    const certificate = new Certificate(this, 'MySiteCertificate', {
      domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      validation: CertificateValidation.fromDns(hostedZone),
    })

    const s3Bucket = new Bucket(self, `${id}-bucket`, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    })

    const oai = new OriginAccessIdentity(this, 'MySiteOAI')
    s3Bucket.grantRead(oai)

    const distribution = new Distribution(this, 'MySiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(s3Bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [domainName, `www.${domainName}`],
      certificate: certificate,
      defaultRootObject: 'index.html',
    })

    new ARecord(this, 'MySiteARecord', {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    })

    new ARecord(this, 'MySiteWwwARecord', {
      zone: hostedZone,
      recordName: `www.${domainName}`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    })

    new BucketDeployment(self, `${id}-deployment`, {
      sources: [Source.asset('../front-end')],
      destinationBucket: s3Bucket,
    })

    new CfnOutput(self, `${id}-uri-link`, {
      value: `https://${domainName}`,
    })
  }
}
