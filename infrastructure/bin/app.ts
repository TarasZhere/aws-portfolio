#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { WebsiteStack } from '../lib/stacks/s3stack';
const app = new cdk.App();
export const portfolio = 'portfolio';

new WebsiteStack(app, portfolio, {});
