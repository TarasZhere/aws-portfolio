import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebsiteStack } from '../lib/stacks/s3stack';
import { portfolio } from '../bin/app';

test('Snapshot Test', () => {
  const app = new cdk.App();
  const websiteStack = new WebsiteStack(app, portfolio);
  const template = Template.fromStack(websiteStack);
  expect(template).toMatchSnapshot();
});
