#!/usr/bin/env node

import { runKpaCheck } from './index';

process.exitCode = runKpaCheck(process.argv.slice(2));
